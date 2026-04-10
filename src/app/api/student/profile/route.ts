import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs'; // Ensure you have bcryptjs installed

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');

// Helper to get User ID from JWT
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const { payload } = await jwtVerify(token, secret);
  return payload.id;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, student_id, full_name, email, grade, phone, profile_image FROM students WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, student: rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}

// ✅ NEW: PATCH method to update Profile Identity & Connectivity
export async function PATCH(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const { full_name, grade, phone } = await req.json();

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE students SET full_name = ?, grade = ?, phone = ? WHERE id = ?',
      [full_name, grade, phone, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}