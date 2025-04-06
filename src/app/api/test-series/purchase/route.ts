import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

interface TestSeries {
  id: number;
  name: string;
  coin_cost: number;
}

interface User {
  id: number;
  coins: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { testSeriesId } = await request.json();

    if (!testSeriesId) {
      return NextResponse.json(
        { error: "Test series ID is required" },
        { status: 400 }
      );
    }

    // Check if user has already purchased this test series
    const existingPurchases = await executeQuery<{ id: number }[]>({
      query: "SELECT id FROM user_test_series WHERE user_id = ? AND test_series_id = ?",
      values: [session.user.id, testSeriesId]
    });

    if (existingPurchases.length > 0) {
      return NextResponse.json(
        { error: "You have already purchased this test series" },
        { status: 409 }
      );
    }

    // Get the test series to check the cost
    const testSeries = await executeQuery<TestSeries[]>({
      query: "SELECT id, name, coin_cost FROM test_series WHERE id = ?",
      values: [testSeriesId]
    });

    if (!testSeries.length) {
      return NextResponse.json({ error: "Test series not found" }, { status: 404 });
    }

    // Get user's current coin balance
    const users = await executeQuery<User[]>({
      query: "SELECT id, coins FROM users WHERE id = ?",
      values: [session.user.id]
    });

    const user = users[0];
    const series = testSeries[0];

    // Check if user has enough coins
    if (user.coins < series.coin_cost) {
      return NextResponse.json(
        { error: "Not enough coins to purchase this test series" },
        { status: 400 }
      );
    }

    // Begin transaction
    await executeQuery({
      query: "START TRANSACTION",
      values: []
    });

    try {
      // Deduct coins from user
      await executeQuery({
        query: "UPDATE users SET coins = coins - ? WHERE id = ?",
        values: [series.coin_cost, session.user.id]
      });

      // Record the purchase
      await executeQuery({
        query: "INSERT INTO user_test_series (user_id, test_series_id) VALUES (?, ?)",
        values: [session.user.id, testSeriesId]
      });

      // Commit transaction
      await executeQuery({
        query: "COMMIT",
        values: []
      });

      return NextResponse.json({
        message: `Successfully purchased ${series.name}`,
        remainingCoins: user.coins - series.coin_cost
      });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery({
        query: "ROLLBACK",
        values: []
      });
      throw error;
    }
  } catch (error) {
    console.error("Test series purchase error:", error);
    return NextResponse.json(
      { error: "An error occurred while purchasing the test series" },
      { status: 500 }
    );
  }
}
