import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { createNotification } from '@/lib/db/notifications'; // Ensure this helper exists
import { RowDataPacket } from 'mysql2/promise';

// 1. FETCH ALL STUDENTS
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, student_id, full_name, email, grade, phone, status, created_at FROM students ORDER BY created_at DESC'
    );

    return NextResponse.json({ success: true, students: rows });
  } catch (error) {
    console.error('Database Fetch Error:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" }, 
      { status: 500 }
    );
  }
}

// 2. UPDATE STUDENT STATUS & NOTIFY
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Missing ID or Status" }, { status: 400 });
    }

    // Update status in the database
    await pool.query(
      'UPDATE students SET status = ? WHERE id = ?',
      [status, id]
    );

    // Trigger Notification if status is 'Active' (Approved)
    if (status === 'Active') {
      await createNotification(
        id, 
        "Registration Approved! 🎉", 
        "Welcome! Your account has been verified. You can now access your lessons and materials."
      );
    } 
    // Trigger Notification if status is 'Inactive' (Rejected/Suspended)
    else if (status === 'Suspended') {
      await createNotification(
        id, 
        "Account Status Update", 
        "Your account has been suspended. Please contact support for more details."
      );
    }

    return NextResponse.json({ success: true, message: `Student marked as ${status}` });

  } catch (error) {
    console.error('Database Update Error:', error);
    return NextResponse.json(
      { success: false, message: "Update failed" }, 
      { status: 500 }
    );
  }
}