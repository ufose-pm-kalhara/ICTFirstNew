import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// --- GET: Fetch List with Material Details ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    // Handle single file preview/download
    if (fileId) {
      const [file] = await pool.query<RowDataPacket[]>(
        'SELECT file_data, file_type FROM materials WHERE id = ?', [fileId]
      );
      if (!file || file.length === 0) return NextResponse.json({ error: "File not found" }, { status: 404 });
      return new Response(file[0].file_data, {
        headers: { 'Content-Type': file[0].file_type || 'application/pdf' },
      });
    }

    /**
     * UNIVERSAL COMPATIBILITY FIX:
     * Using GROUP_CONCAT to manually build a JSON string.
     * COALESCE ensures we return an empty array string "[]" if no files exist.
     */
    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT rl.*, 
        (
          SELECT GROUP_CONCAT(
            CONCAT('{"id":', id, ',"label":"', REPLACE(title, '"', '\\"'), '"}')
          )
          FROM materials 
          WHERE FIND_IN_SET(id, IFNULL(rl.material_id, ''))
        ) as material_list_string
       FROM recorded_lessons rl
       ORDER BY rl.created_at DESC`
    );

    // Map the result so the frontend gets the JSON string it expects
    const formattedVideos = videos.map(v => ({
      ...v,
      material_ids: v.material_list_string ? `[${v.material_list_string}]` : "[]"
    }));
    
    return NextResponse.json({ success: true, videos: formattedVideos });

  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// --- POST: Create New Lesson ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title');
    const grade = formData.get('grade');
    const month = formData.get('month');
    const type = formData.get('type');
    const videoUrls = formData.get('videoUrls') as string;
    const description = formData.get('description');
    
    const files = formData.getAll('files') as File[];
    const materialIds: number[] = [];

    // Save New Files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const label = formData.get(`label_${i}`) as string || file.name;
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const [matResult] = await pool.query<ResultSetHeader>(
          'INSERT INTO materials (title, file_data, file_type, file_size, created_by) VALUES (?, ?, ?, ?, ?)',
          [label, buffer, file.type, file.size, 1]
        );
        materialIds.push(matResult.insertId);
      }
    }

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

interface ExistingFile {
  id: number;
}

// --- PUT: Update Existing Lesson ---
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const grade = formData.get('grade');
    const month = formData.get('month');
    const type = formData.get('type');
    const videoUrls = formData.get('videoUrls') as string;
    const description = formData.get('description');
    
    // 1. Get IDs of files the admin decided to keep (removes deleted ones)
    const existingFilesJson = formData.get('existingFiles') as string;
    const existingFiles = JSON.parse(existingFilesJson || '[]') as ExistingFile[];
    const currentMaterialIds: number[] = existingFiles.map((f: ExistingFile) => f.id);

    // 2. Upload brand new files
    const newFiles = formData.getAll('files') as File[];
    for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const label = formData.get(`label_${i}`) as string || file.name;
        if (file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const [matResult] = await pool.query<ResultSetHeader>(
                'INSERT INTO materials (title, file_data, file_type, file_size, created_by) VALUES (?, ?, ?, ?, ?)',
                [label, buffer, file.type, file.size, 1]
            );
            currentMaterialIds.push(matResult.insertId);
        }
    }

    // 3. Update the record with the merged ID list
    await pool.query(
      `UPDATE recorded_lessons 
       SET title = ?, grade = ?, month = ?, type = ?, video_url = ?, description = ?, material_id = ?
       WHERE id = ?`,
      [title, grade, month, type, videoUrls, description, currentMaterialIds.join(','), id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// --- DELETE: Remove Lesson and its PDFs ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    const [lesson] = await pool.query<RowDataPacket[]>(
      "SELECT material_id FROM recorded_lessons WHERE id = ?", [id]
    );
    
    const mIds = lesson[0]?.material_id;
    if (mIds) {
      const idArray = mIds.split(',');
      // Delete child materials first
      await pool.query(`DELETE FROM materials WHERE id IN (?)`, [idArray]);
    }

    // Delete the lesson itself
    await pool.query("DELETE FROM recorded_lessons WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}