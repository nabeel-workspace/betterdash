import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { auth } from '@/lib/auth'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest()

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  return next({
    context: { session },
  })
})

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next }) => {
    const request = getRequest()

    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      // throw redirect({ to: '/auth/signin' })
      throw redirect({ to: '/sign-in' })
    }

    // if (!session.user?.emailVerified) {
    //   throw redirect({ to: '/email-verified' })
    // }

    return next({
      context: { session },
    })
  },
)
