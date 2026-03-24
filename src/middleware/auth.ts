import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'

import { auth } from '@/lib/auth.server'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return next({
      context: { session },
    })
  },
)

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      throw redirect({ to: '/sign-in' })
    }

    if (!session.user?.emailVerified) {
      throw redirect({
        to: '/email-verification',
        search: { email: session.user.email },
      })
    }

    return next({
      context: { session },
    })
  },
)
