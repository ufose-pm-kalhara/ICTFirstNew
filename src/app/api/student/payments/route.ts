import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET: Fetch payment history
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    // ✅ Added lesson_id and billing_month to selection
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, amount, status, proof_url, billing_month, lesson_id, created_at FROM payments WHERE student_id = ? ORDER BY created_at DESC',
      [payload.id]
    );

    return NextResponse.json({ success: true, payments: rows });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    const { amount, proof_url, billing_month, lesson_id } = await req.json();

    // ✅ Clean conversion for INT column
    // This handles strings, nulls, and empty values safely
    const numericLessonId = (lesson_id !== null && lesson_id !== undefined && lesson_id !== "") 
      ? parseInt(lesson_id, 10) 
      : null;

    const [result] = await pool.query(
      'INSERT INTO payments (student_id, amount, proof_url, billing_month, lesson_id, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [payload.id, amount, proof_url, billing_month, numericLessonId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
