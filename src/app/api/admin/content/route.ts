import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// --- GET: Fetch List ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    // Handle single file preview (unchanged logic)
    if (fileId) {
      const [file] = await pool.query<RowDataPacket[]>(
        'SELECT file_data, file_type FROM materials WHERE id = ?', [fileId]
      );
      if (!file || file.length === 0) return NextResponse.json({ error: "File not found" }, { status: 404 });
      return new Response(file[0].file_data, {
        headers: { 'Content-Type': file[0].file_type || 'application/pdf' },
      });
    }

    // Fetch lessons - Added 'month' and 'type' to the query!
    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, grade, month, type, video_url, description, notes, material_id, created_at 
       FROM recorded_lessons 
       ORDER BY created_at DESC`
    );
    
    return NextResponse.json({ success: true, videos: videos || [] });

  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// --- POST: Create New Lesson + Multi-PDF Upload ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const grade = formData.get('grade') as string;
    const month = formData.get('month') as string;
    const type = formData.get('type') as string;
    const videoUrls = formData.get('videoUrls') as string; // This is a JSON string from frontend
    const description = formData.get('description') as string;
    
    // Handle Multiple Files
    const files = formData.getAll('files') as File[];
    const materialIds: number[] = [];

    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const [matResult] = await pool.query<ResultSetHeader>(
          'INSERT INTO materials (title, file_data, file_type, file_size, created_by) VALUES (?, ?, ?, ?, ?)',
          [file.name, buffer, file.type, file.size, 1]
        );
        materialIds.push(matResult.insertId);
      }
    }

    // Save to recorded_lessons
    // We store materialIds as a comma-separated string or JSON
    await pool.query<ResultSetHeader>(
      `INSERT INTO recorded_lessons 
      (title, grade, month, type, video_url, description, material_id, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, grade, month, type, videoUrls, description, materialIds.join(','), 1]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// --- DELETE: Remove Lesson and its PDFs ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    // 1. Find all associated material IDs
    const [lesson] = await pool.query<RowDataPacket[]>(
      "SELECT material_id FROM recorded_lessons WHERE id = ?", [id]
    );
    
    const mIds = lesson[0]?.material_id; // e.g., "10,11,12"

    if (mIds) {
      const idArray = mIds.split(',');
      // Delete all materials in the list
      await pool.query(`DELETE FROM materials WHERE id IN (?)`, [idArray]);
    }

    // 2. Delete the lesson
    await pool.query("DELETE FROM recorded_lessons WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}