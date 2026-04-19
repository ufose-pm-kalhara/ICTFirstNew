import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { StudentService } from '@/services/studentService';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate the new studentId field
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: 'Invalid Student ID or Password' }, { status: 400 });
    }

    const { studentId, password } = validation.data;

    // 2. Find user by Student ID
    const user = await StudentService.findByStudentId(studentId);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // 2.5 Check if account is Suspended
    // This blocks access before even checking the password
    if (user.status === 'Suspended') {
      return NextResponse.json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact support.' 
      }, { status: 403 });
    }

    // 3. Check Password Match
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Create JWT (Include Student ID in the payload)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const token = await new SignJWT({ 
      id: user.id, 
      studentId: user.student_id, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    // 5. Set Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      role: user.role,
      user: { 
        fullName: user.full_name, 
        studentId: user.student_id,
        role: user.role
      } 
    });

  } catch (error: unknown) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}