import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) return NextResponse.json({ success: false, message: "No token" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);
    
    // Log this to your terminal to see what the student's grade is
    console.log("Logged in student grade:", payload.grade);

    // TRY 1: Simple query without reset_token first to see if it works
    // If this works, then the issue was the reset_token column missing
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM recorded_lessons WHERE grade = ? ORDER BY id DESC`,
            [payload.grade]
        );
        
        if (rows.length > 0) {
            return NextResponse.json({ success: true, lessons: rows });
        }
    } catch (dbError) {
        console.error("Database Query Error:", dbError);
    }

    // FALLBACK: Get everything regardless of grade
    const [allRows] = await pool.query<RowDataPacket[]>(`SELECT * FROM recorded_lessons`);
    return NextResponse.json({ success: true, lessons: allRows });

  } catch (error) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}