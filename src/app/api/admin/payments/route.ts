import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';
import { createNotification } from '@/lib/db/notifications'; // Import your helper

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, s.full_name, s.student_id 
      FROM payments p 
      JOIN students s ON p.student_id = s.id 
      ORDER BY p.created_at DESC
    `);
    
    return NextResponse.json({ success: true, payments: rows });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, remarks } = await req.json();

    // 1. First, fetch the student_id and payment details before updating
    const [paymentData] = await pool.query<RowDataPacket[]>(
      'SELECT student_id, amount, billing_month FROM payments WHERE id = ?',
      [id]
    );

    if (paymentData.length === 0) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    const targetStudentId = paymentData[0].student_id;
    const amount = paymentData[0].amount;
    const month = paymentData[0].billing_month;

    // 2. Update the payment status in the database
    await pool.query(
      'UPDATE payments SET status = ?, remarks = ?, verified_at = NOW() WHERE id = ?',
      [status, remarks, id]
    );

    // 3. Trigger Notification based on the new status
    // FIX: Check for both 'completed' and 'approved' to ensure it triggers
    if (status === 'completed' || status === 'approved') {
      await createNotification(
        targetStudentId,
        "Payment Approved ✅",
        `Your payment of Rs. ${amount} for ${month} has been verified successfully.`
      );
    } else if (status === 'rejected') {
      await createNotification(
        targetStudentId,
        "Payment Rejected ❌",
        `Your payment for ${month} was rejected. Reason: ${remarks || 'Invalid proof'}. Please re-upload.`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

}