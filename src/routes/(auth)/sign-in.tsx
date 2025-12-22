import { SignIn } from '@/features/auth/sign-in'
import { getSession } from '@/server-fn/get-session'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getSession()
    return { session }
  },
  loader: ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/' })
    }
    return context
  },
})
