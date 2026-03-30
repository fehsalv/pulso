import { z } from 'zod'

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es muy largo'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  fechaNacimiento: z
    .string()
    .refine((val) => {
      const fecha = new Date(val)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fecha.getFullYear()
      const cumpleEsteAnio = new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate())
      const edadReal = hoy >= cumpleEsteAnio ? edad : edad - 1
      return edadReal >= 18
    }, 'Debes ser mayor de 18 años para registrarte'),
  ciudad: z.string().min(2).max(80).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido').toLowerCase(),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

// Calcula edad en años desde una fecha
export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date()
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
  const cumple = new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate())
  return hoy >= cumple ? edad : edad - 1
}
