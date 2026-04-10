import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { createNotification } from '@/lib/db/notifications';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentId = body.id; // Now 'studentId' is defined!

    if (!studentId) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    // 1. Update status in DB
    await pool.query(
      "UPDATE students SET status = 'Active' WHERE id = ?",
      [studentId]
    );

    // 2. Create the notification (Using your table)
    await createNotification(
      studentId, 
      "Registration Approved! 🎉", 
      "Welcome back! Your account is now active. You can access your lessons now."
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Database update failed" }, { status: 500 });
  }
}