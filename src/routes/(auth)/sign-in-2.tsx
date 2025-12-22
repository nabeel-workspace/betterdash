import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'
import { getSession } from '@/server-fn/get-session'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/sign-in-2')({
  component: SignIn2,
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
