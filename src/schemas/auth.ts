import { z } from 'zod'

/**
 * Schema for the Sign Up (Register) form, matching your backend requirements
 * - email (String, required, unique)
 * - password (String, required)
 */
export const RegisterSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  // We add a frontend rule for password length as a good practice
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})
export type RegisterType = z.infer<typeof RegisterSchema>

/**
 * Schema for the Login form
 */
export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginType = z.infer<typeof LoginSchema>