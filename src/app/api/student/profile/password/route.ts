import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;

    const { currentPassword, newPassword } = await req.json();

    // 1. Fetch using 'password_hash' instead of 'password'
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT password_hash FROM students WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) return NextResponse.json({ success: false }, { status: 404 });

    // 2. Compare using the correct column property
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password incorrect' }, { status: 400 });
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update the 'password_hash' column
    await pool.query<ResultSetHeader>(
      'UPDATE students SET password_hash = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Password Update Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}