import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  profile_picture: string | null;
  coins: number;
  created_at: string;
}

interface ProgressStats {
  total_questions: number;
  correct_answers: number;
}

interface RankResult {
  rank: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const users = await executeQuery<UserProfile[]>({
      query: `
        SELECT id, username, email, full_name, profile_picture, coins, created_at
        FROM users
        WHERE id = ?
      `,
      values: [session.user.id]
    });

    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's completed questions count
    const progressStats = await executeQuery<ProgressStats[]>({
      query: `
        SELECT
          COUNT(up.id) as total_questions,
          SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
        FROM user_progress up
        WHERE up.user_id = ?
      `,
      values: [session.user.id]
    });

    // Get user's ranking based on coins
    const rankingResult = await executeQuery<RankResult[]>({
      query: `
        SELECT
          (SELECT COUNT(*) + 1 FROM users WHERE coins > u.coins) as rank
        FROM users u
        WHERE u.id = ?
      `,
      values: [session.user.id]
    });

    const userProfile = {
      ...users[0],
      stats: {
        totalQuestions: progressStats[0]?.total_questions || 0,
        correctAnswers: progressStats[0]?.correct_answers || 0,
        rank: rankingResult[0]?.rank || 0
      }
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { full_name, profile_picture } = await request.json();

    // Update user profile
    await executeQuery({
      query: `
        UPDATE users
        SET full_name = ?, profile_picture = ?
        WHERE id = ?
      `,
      values: [full_name || null, profile_picture || null, session.user.id]
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}
