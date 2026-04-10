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

    // 1. Try to fetch lessons for the specific grade
    let [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, grade, video_url, description, notes, material_id 
       FROM recorded_lessons 
       WHERE grade = ? 
       ORDER BY id DESC`,
      [studentGrade]
    );

    // 2. FALLBACK: If no lessons found for that grade, fetch ALL lessons 
    // This ensures your dashboard isn't empty while you debug the grade values
    if (rows.length === 0) {
      const [allRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, title, grade, video_url, description, notes, material_id 
         FROM recorded_lessons 
         ORDER BY id DESC`
      );
      rows = allRows;
    }

    return NextResponse.json({ success: true, lessons: rows });
  } catch (error) {
    console.error("Fetch Lessons Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}