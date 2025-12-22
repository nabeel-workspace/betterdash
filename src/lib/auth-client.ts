import { passkeyClient } from '@better-auth/passkey/client'
import {
  adminClient,
  anonymousClient,
  twoFactorClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    passkeyClient(),
    twoFactorClient(),
    anonymousClient(),
  ],
})
