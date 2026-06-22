import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  role: z.enum(['ADMIN', 'MEMBER', 'DEVICE', 'HOMEMAKER']),
  avatar: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
})

export type User = z.infer<typeof userSchema>
