import { z } from 'zod';

export const loginSchema = z.object({
  studentId: z.string().min(5, 'Student ID is required'), 
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name is too short')
    // Matches frontend: Only letters and spaces allowed
    .regex(/^[a-zA-Z\s]*$/, "Name cannot contain numbers or symbols"),
    
  email: z.string().email('Invalid email'),
  
  password: z.string().min(8, 'Password must be at least 8 characters'),
  
  grade: z.coerce.number().refine(n => n === 10 || n === 11, "Grade must be 10 or 11"),
  
  // Updated: Now requires exactly 10 digits to match your security rules
  phone: z.string()
    .length(10, 'WhatsApp number must be exactly 10 digits')
    .regex(/^\d+$/, 'WhatsApp number must contain only numbers'),
});