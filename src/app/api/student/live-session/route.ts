import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);
    const studentGrade = payload.grade;

    // 1. Try fetching for the specific grade
    let [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, url, announcement, lesson_id 
       FROM live_links 
       WHERE grade = ? 
       ORDER BY id DESC LIMIT 1`,
      [studentGrade]
    );

    // 2. FALLBACK: If no link for that grade, get the latest link regardless of grade
    if (rows.length === 0) {
      const [allRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, title, url, announcement, lesson_id 
         FROM live_links 
         ORDER BY id DESC LIMIT 1`
      );
      rows = allRows;
    }

    return NextResponse.json({
      success: true,
      session: rows.length > 0 ? rows[0] : null
    });

  } catch (error) {
    console.error("Live Link Fetch Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}