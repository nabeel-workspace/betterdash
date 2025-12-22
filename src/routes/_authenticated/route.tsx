import { getSession } from '@/server-fn/get-session'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    const session = await getSession()
    return { session }
  },
  loader: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/sign-in' })
    }

    if (!context.session.user?.emailVerified) {
      throw redirect({
        to: '/email-verification',
        search: { email: context.session.user.email },
      })
    }

    return context
  },
})
