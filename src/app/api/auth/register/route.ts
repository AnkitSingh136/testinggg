import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db";

interface UserCount {
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName } = await request.json();

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUsers = await executeQuery<UserCount[]>({
      query: "SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?",
      values: [username, email]
    });

    if (existingUsers.length > 0 && existingUsers[0]?.count > 0) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await executeQuery({
      query: `
        INSERT INTO users (username, email, password, full_name, coins)
        VALUES (?, ?, ?, ?, 0)
      `,
      values: [username, email, hashedPassword, fullName || null]
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
