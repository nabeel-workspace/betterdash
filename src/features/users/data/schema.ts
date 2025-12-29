import { z } from 'zod'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable().optional(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banned: z.boolean().nullable().optional(),
  isAnonymous: z.boolean().nullable().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
