import { Users } from '@/features/users'
import { roles } from '@/features/users/data/data'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  banned: z.array(z.string()).optional().catch([]),
  isAnonymous: z.array(z.string()).optional().catch([]),
  role: z
    .array(z.enum(roles.map((r) => r.value as (typeof roles)[number]['value'])))
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
  sort: z
    .array(z.object({ id: z.string(), desc: z.boolean() }))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
})
