import { type NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface UserProfile {
  id: number;
  username: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await executeQuery<UserProfile[]>({
      query: `
        SELECT id, username, full_name, profile_picture, coins, created_at
        FROM users
        WHERE id = ?
      `,
      values: [userId]
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
      values: [userId]
    });

    // Get user's ranking based on coins
    const rankingResult = await executeQuery<RankResult[]>({
      query: `
        SELECT
          (SELECT COUNT(*) + 1 FROM users WHERE coins > u.coins) as rank
        FROM users u
        WHERE u.id = ?
      `,
      values: [userId]
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
