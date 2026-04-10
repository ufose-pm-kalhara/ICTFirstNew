import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    // Fetch notifications and unread count
    const [notifications] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [payload.id]
    );

    const [unread] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [payload.id]
    );

    return NextResponse.json({ 
      success: true, 
      notifications, 
      unreadCount: unread[0].count 
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}