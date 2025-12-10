import { prismaAdapter } from 'better-auth/adapters/prisma'
import { getMinimalEmailHtml } from './emals'
import { admin, twoFactor } from 'better-auth/plugins'
import { betterAuth } from 'better-auth'
import { SendMail } from './resend'
import prisma from './prisma'

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
    // requireEmailVerification: true,
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
  plugins: [admin(), twoFactor()],
  advanced: {
    trustedOrigins: [process.env.BETTER_AUTH_URL!],
    database: {
      generateId: false,
    },
  },
})
