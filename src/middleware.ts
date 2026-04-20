import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session_token')?.value;
  const { pathname } = req.nextUrl;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');

  // 1. PUBLIC ASSETS: Ignore these completely
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. NO TOKEN CASE
  if (!token) {
    if (pathname.startsWith('/student') || pathname.startsWith('/admin')) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      // Ensure no cache on redirect
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      return response;
    }
    return NextResponse.next();
  }

  try {
    // 3. VERIFY TOKEN
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;

    let response = NextResponse.next();

    // 4. LOGIN REDIRECT: If already logged in, don't show the login page
    if (pathname === '/login') {
      const dest = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      response = NextResponse.redirect(new URL(dest, req.url));
    }

    // 5. ADMIN PROTECTION
    else if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.warn(`🚨 Unauthorized Admin access attempt by: ${userRole}`);
        response = NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
    }

    // 6. STUDENT PROTECTION
    else if (pathname.startsWith('/student')) {
      if (userRole !== 'student' && userRole !== 'admin') {
        response = NextResponse.redirect(new URL('/login', req.url));
      }
    }

    /**
     * CACHE PREVENTION:
     * This is the fix for the back-button issue. By setting these headers, 
     * we tell the browser "Do not store this page in memory." 
     * When the user clicks 'Back' after logout, the browser is forced 
     * to run this middleware again, which will find no token and redirect to login.
     */
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error("Middleware Auth Error:", error);
    const loginUrl = new URL('/login', req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_token'); 
    // Prevent caching the redirected login page too
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/login',
  ],
};