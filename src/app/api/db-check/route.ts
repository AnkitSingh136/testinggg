import { NextResponse } from 'next/server';
import { testConnection, executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if users table exists
    try {
      await executeQuery({
        query: 'SELECT 1 FROM users LIMIT 1',
        values: []
      });

      return NextResponse.json(
        {
          status: 'ok',
          message: 'Database connection successful and tables exist',
          dbConfig: {
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            database: process.env.MYSQL_DATABASE || 'ace_aptitude',
          }
        }
      );
    } catch (tableError) {
      return NextResponse.json(
        {
          status: 'warning',
          message: 'Database connected but tables do not exist. Please run schema.sql to initialize the database.',
          dbConfig: {
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            database: process.env.MYSQL_DATABASE || 'ace_aptitude',
          }
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'An error occurred during database check',
        error: String(error)
      },
      { status: 500 }
    );
  }
}
