import { z } from 'zod'

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fechaNacimiento: z
    .string()
    .refine((val) => {
      const fecha = new Date(val)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fecha.getFullYear()
      const cumpleEsteAnio = new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate())
      const edadReal = hoy >= cumpleEsteAnio ? edad : edad - 1
      return edadReal >= 18
    }, 'You must be at least 18 years old to register'),
  ciudad: z.string().min(2, 'City must be at least 2 characters').max(80).optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Please enter your password'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date()
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
  const cumple = new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate())
  return hoy >= cumple ? edad : edad - 1
}