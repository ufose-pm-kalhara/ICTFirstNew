import pool from '@/lib/db/mysql';

export async function createNotification(userId: number, title: string, message: string) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, title, message]
    );
    return { success: true };
  } catch (error) {
    console.error('Notification Error:', error);
    return { success: false };
  }
}