import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { StudentService } from '@/services/studentService';
import { registerSchema } from '@/lib/validators/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validation (Zod Schema)
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { fullName, email, password, grade, phone } = validation.data;

    // --- NEW SECURITY CHECKS (Server-side) ---

    // A. Re-verify Name (No numbers or symbols)
    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(fullName)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Full name cannot contain numbers or symbols.' 
      }, { status: 400 });
    }

    // B. Re-verify Phone (Exactly 10 digits)
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ 
        success: false, 
        message: 'WhatsApp number must be exactly 10 digits.' 
      }, { status: 400 });
    }

    // ----------------------------------------

    // 2. Check if email already exists
    const existingUser = await StudentService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'This email is already registered.' 
      }, { status: 400 });
    }

    // 3. Generate Unique Student ID (GD + Grade + "-" + 5 Random Digits)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const generatedStudentId = `GD${grade}-${randomDigits}`;

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save to Database
    await StudentService.create({
      studentId: generatedStudentId,
      fullName,
      email,
      passwordHash: hashedPassword,
      grade,
      phone: phone || null
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful!',
      data: {
        studentId: generatedStudentId,
        fullName: fullName
      }
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ REGISTRATION FAILURE:', errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Database error. Please try again later.',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}