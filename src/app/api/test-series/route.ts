import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

interface TestSeries {
  id: number;
  name: string;
  description: string;
  coin_cost: number;
  created_at: string;
  question_count: number;
  purchased: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    let query = `
      SELECT
        ts.id,
        ts.name,
        ts.description,
        ts.coin_cost,
        ts.created_at,
        COUNT(q.id) as question_count
    `;

    let values: (string | number)[] = [];

    if (session?.user) {
      query += `,
        CASE WHEN uts.id IS NOT NULL THEN 1 ELSE 0 END as purchased
      FROM test_series ts
      LEFT JOIN questions q ON ts.id = q.test_series_id
      LEFT JOIN user_test_series uts ON ts.id = uts.test_series_id AND uts.user_id = ?
      GROUP BY ts.id
      ORDER BY ts.name
      `;
      values = [session.user.id];
    } else {
      query += `
      FROM test_series ts
      LEFT JOIN questions q ON ts.id = q.test_series_id
      GROUP BY ts.id
      ORDER BY ts.name
      `;
    }

    const testSeries = await executeQuery<TestSeries[]>({
      query,
      values
    });

    return NextResponse.json(testSeries);
  } catch (error) {
    console.error("Test series fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching test series" },
      { status: 500 }
    );
  }
}
