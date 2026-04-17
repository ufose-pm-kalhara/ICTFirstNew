import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isAll = searchParams.get('all');
  const month = searchParams.get('month');
  const grade = searchParams.get('grade');

  try {
    if (isAll) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM live_links ORDER BY created_at DESC');
      return NextResponse.json({ success: true, sessions: rows });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM live_links WHERE month = ? AND grade = ? LIMIT 1', 
      [month, grade]
    );
    return NextResponse.json({ success: true, live: rows[0] || null });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, url, announcement, lesson_id, class_date, class_time } = body;

    // We need to find the month and grade to identify which card this live session belongs to.
    // If your table for lessons isn't named "lessons", we'll pull them from the request body.
    // Ensure your frontend is sending month and grade in the handleSubmit form state.
    const month = body.month; 
    const grade = body.grade;

    // 1. Check if we are updating an existing entry by ID
    if (id) {
      await pool.query(
        `UPDATE live_links 
         SET title = ?, url = ?, announcement = ?, lesson_id = ?, class_date = ?, class_time = ?
         WHERE id = ?`,
        [title, url, announcement, lesson_id, class_date, class_time, id]
      );
    } else {
      // 2. INSERT new session
      await pool.query(
        `INSERT INTO live_links 
         (title, url, month, grade, announcement, lesson_id, class_date, class_time, start_time, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
        [title, url, month, grade, announcement, lesson_id, class_date, class_time]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    await pool.query('DELETE FROM live_links WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}