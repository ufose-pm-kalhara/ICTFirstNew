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
    const { title, url, month, grade, announcement, lesson_id } = await req.json();
    
    // Check if entry exists for this month and grade
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM live_links WHERE month = ? AND grade = ?', 
      [month, grade]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE live_links SET title = ?, url = ?, announcement = ?, lesson_id = ? WHERE id = ?',
        [title, url, announcement, lesson_id, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO live_links (title, url, month, grade, announcement, lesson_id, start_time, created_by) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)',
        [title, url, month, grade, announcement, lesson_id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
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