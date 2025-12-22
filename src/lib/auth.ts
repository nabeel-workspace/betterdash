import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, anonymous, twoFactor } from 'better-auth/plugins'

import { getMinimalEmailHtml } from './emals'
import prisma from './prisma'
import { SendMail } from './resend'

const appUrl = process.env.BETTER_AUTH_URL

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (data) => {
      const resetUrl = `${appUrl}/reset-password?token=${data.token}`

      const emailHtml = getMinimalEmailHtml({
        title: 'Reset Your Password',
        username: data.user.name,
        body: 'We received a request to reset your password. Click the button below to set a new one.',
        buttonText: 'Reset Password',
        link: resetUrl,
      })

      await SendMail({
        to: data.user.email,
        subject: 'Reset Your Password',
        text: `Reset password link: ${resetUrl}`,
        html: emailHtml,
      })
    },
  },

  emailVerification: {
    sendVerificationEmail: async (data) => {
      const emailHtml = getMinimalEmailHtml({
        title: 'Verify Your New Email Address',
        username: data.user.name,
        body: `Click the button below to verify your new email address: **${data.user.email}**`,
        buttonText: 'Verify Email',
        link: data.url,
      })

      void SendMail({
        to: data.user.email,
        subject: 'Final Step: Verify Your New Email Address',
        text: `Verify email link: ${data.url}`,
        html: emailHtml,
      })
    },
  },

  appName: 'BetterDash',
  plugins: [
    admin(),
    passkey(),
    twoFactor(),
    anonymous({
      emailDomainName: 'no-email.betterdash.com',
    }),
  ],
  advanced: {
    trustedOrigins: [process.env.BETTER_AUTH_URL!],
    database: {
      generateId: false,
    },
  },
})
