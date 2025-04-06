import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

interface Question {
  id: number;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty_level: string;
  coins_reward: number;
  attempted: boolean;
  correct: boolean | null;
}

interface Topic {
  id: number;
  category_id: number;
  name: string;
  description: string;
  created_at: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const topicId = params.topicId;

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    // Find questions for this topic
    let questionsQuery = `
      SELECT
        q.id,
        q.topic_id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.difficulty_level,
        q.coins_reward
    `;

    let questionsValues: (string | number)[] = [topicId];

    // If logged in, include user progress
    if (session?.user) {
      questionsQuery += `,
        CASE WHEN up.id IS NOT NULL THEN 1 ELSE 0 END as attempted,
        up.is_correct as correct
      FROM questions q
      LEFT JOIN user_progress up ON q.id = up.question_id AND up.user_id = ?
      WHERE q.topic_id = ?
      ORDER BY q.id
      `;
      questionsValues = [session.user.id, topicId];
    } else {
      questionsQuery += `
      FROM questions q
      WHERE q.topic_id = ?
      ORDER BY q.id
      `;
    }

    const questions = await executeQuery<Question[]>({
      query: questionsQuery,
      values: questionsValues
    });

    // Get topic information
    const topics = await executeQuery<Topic[]>({
      query: `
        SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM topics t
        JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `,
      values: [topicId]
    });

    return NextResponse.json({
      topic: topics[0] || null,
      questions
    });
  } catch (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching questions" },
      { status: 500 }
    );
  }
}
