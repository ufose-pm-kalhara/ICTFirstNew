import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
// 1. Add this import to handle the database row types
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    // 2. Add the Generic type <RowDataPacket[]> to the query
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, grade, created_at FROM recorded_lessons ORDER BY id DESC'
    );

    return NextResponse.json({ 
      success: true, 
      lessons: rows // No 'as any' needed anymore!
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    const { title, type, url, grade } = await req.json();

    if (type === 'document') {
      await pool.query(
        'INSERT INTO materials (title, file_url, file_type, created_by) VALUES (?, ?, ?, ?)',
        [title, url, 'PDF', payload.id]
      );
    } else {
      await pool.query(
        'INSERT INTO recorded_lessons (title, video_url, grade, status, created_by) VALUES (?, ?, ?, "active", ?)',
        [title, url, grade, payload.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}