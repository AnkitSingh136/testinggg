import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  topics: Topic[];
}

interface Topic {
  id: number;
  category_id: number;
  name: string;
  description: string;
  question_count: number;
}

export async function GET() {
  try {
    // Get all categories
    const categories = await executeQuery<Omit<Category, 'topics'>[]>({
      query: `
        SELECT id, name, description, icon, color
        FROM categories
        ORDER BY id
      `,
      values: []
    });

    // Get all topics with question counts
    const topics = await executeQuery<Topic[]>({
      query: `
        SELECT
          t.id,
          t.category_id,
          t.name,
          t.description,
          COUNT(q.id) as question_count
        FROM topics t
        LEFT JOIN questions q ON t.id = q.topic_id
        GROUP BY t.id
        ORDER BY t.category_id, t.name
      `,
      values: []
    });

    // Organize topics by category
    const categoriesWithTopics: Category[] = categories.map(category => ({
      ...category,
      topics: topics.filter(topic => topic.category_id === category.id)
    }));

    return NextResponse.json(categoriesWithTopics);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching categories" },
      { status: 500 }
    );
  }
}
