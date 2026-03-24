import { NextResponse } from 'next/server';
import { query, MIGRATIONS } from '@/lib/db';

export async function POST() {
  try {
    const statements = MIGRATIONS
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const results: string[] = [];
    for (const stmt of statements) {
      await query(stmt + ';');
      // Extract table name for logging
      const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
      if (match) results.push(match[1]);
    }

    return NextResponse.json({
      success: true,
      tables: results,
      message: `Created/verified ${results.length} tables`,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e.message,
        hint: 'Make sure DATABASE_URL is set in .env.local',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run migrations',
    hint: 'curl -X POST http://localhost:3000/api/db/migrate',
  });
}
