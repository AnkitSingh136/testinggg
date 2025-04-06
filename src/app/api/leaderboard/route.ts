import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface LeaderboardUser {
  id: number;
  username: string;
  full_name: string | null;
  profile_picture: string | null;
  coins: number;
  rank: number;
}

export async function GET() {
  try {
    const users = await executeQuery<LeaderboardUser[]>({
      query: `
        SELECT
          id,
          username,
          full_name,
          profile_picture,
          coins,
          RANK() OVER (ORDER BY coins DESC) as rank
        FROM users
        ORDER BY coins DESC
        LIMIT 50
      `,
      values: []
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching leaderboard" },
      { status: 500 }
    );
  }
}
