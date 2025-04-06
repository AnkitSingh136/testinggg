import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

interface Question {
  id: number;
  topic_id: number;
  correct_option: string;
  coins_reward: number;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { questionId, userAnswer } = await request.json();

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: "Question ID and user answer are required" },
        { status: 400 }
      );
    }

    // Get the question to check the correct answer
    const questions = await executeQuery<Question[]>({
      query: "SELECT id, topic_id, correct_option, coins_reward, explanation FROM questions WHERE id = ?",
      values: [questionId]
    });

    if (!questions.length) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const question = questions[0];
    const isCorrect = userAnswer.toUpperCase() === question.correct_option;

    // Check if user has already answered this question
    const existingAttempts = await executeQuery<{ id: number }[]>({
      query: "SELECT id FROM user_progress WHERE user_id = ? AND question_id = ?",
      values: [session.user.id, questionId]
    });

    let coinsEarned = 0;

    // If no previous attempt, award coins for correct answer
    if (existingAttempts.length === 0 && isCorrect) {
      coinsEarned = question.coins_reward;

      // Update user's coin balance
      await executeQuery({
        query: "UPDATE users SET coins = coins + ? WHERE id = ?",
        values: [coinsEarned, session.user.id]
      });
    }

    // Insert or update progress record
    if (existingAttempts.length === 0) {
      await executeQuery({
        query: `
          INSERT INTO user_progress
          (user_id, question_id, user_answer, is_correct, coins_earned)
          VALUES (?, ?, ?, ?, ?)
        `,
        values: [session.user.id, questionId, userAnswer, isCorrect, coinsEarned]
      });
    } else {
      await executeQuery({
        query: `
          UPDATE user_progress
          SET user_answer = ?, is_correct = ?, attempt_time = CURRENT_TIMESTAMP
          WHERE user_id = ? AND question_id = ?
        `,
        values: [userAnswer, isCorrect, session.user.id, questionId]
      });
    }

    return NextResponse.json({
      isCorrect,
      coinsEarned,
      correctOption: question.correct_option,
      explanation: question.explanation
    });
  } catch (error) {
    console.error("Answer submission error:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting your answer" },
      { status: 500 }
    );
  }
}
