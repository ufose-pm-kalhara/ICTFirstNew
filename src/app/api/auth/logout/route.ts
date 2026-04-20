import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // 1. Delete the session cookie
  cookieStore.delete('session_token');

  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out' 
  });

  // 2. Clear-Site-Data tells the browser to wipe cookies, storage, and cache
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
  
  // 3. Ensure the browser doesn't try to store this specific response
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}