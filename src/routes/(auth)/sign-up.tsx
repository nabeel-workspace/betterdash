import { SignUp } from '@/features/auth/sign-up'
import { getSession } from '@/server-fn/get-session'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
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
