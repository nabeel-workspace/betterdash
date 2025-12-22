import { Totp } from '@/features/auth/totp'
import { getSession } from '@/server-fn/get-session'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/totp')({
  component: Totp,
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
