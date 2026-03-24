import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import {
  admin as adminPlugin,
  anonymous,
  twoFactor,
  username,
} from 'better-auth/plugins'

import { getMinimalEmailHtml } from './emals'
import { env } from './env.server'
import { ac, adminRole, userRole } from './permissions'
import prisma from './prisma'
import { SendMail } from './resend'

const appUrl = env.BETTER_AUTH_URL

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/api/auth/sign-in/email': { window: 60, max: 5 },
      '/api/auth/sign-up/email': { window: 60, max: 3 },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 300,
      strategy: 'jwe',
    },
  },

  account: {
    encryptOAuthTokens: true,
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
    username({
      usernameValidator: (username) => {
        const reservedWords = [
          'admin',
          'administrator',
          'root',
          'support',
          'help',
          'info',
          'contact',
          'mail',
          'postmaster',
          'webmaster',
          'sysadmin',
          'owner',
          'moderator',
          'official',
          'system',
          'guest',
          'user',
          'username',
          'login',
          'logout',
          'signin',
          'signup',
          'register',
          'portal',
          'api',
          'dashboard',
          'settings',
          'profile',
          'account',
          'verify',
          'verification',
          'security',
          'auth',
          'authentication',
          'oauth',
          'token',
          'password',
          'reset',
          'forgot',
          'change',
          'update',
          'delete',
          'remove',
          'search',
          'home',
          'index',
          'main',
          'status',
          'health',
          'test',
          'dev',
          'developer',
          'staging',
          'prod',
          'production',
          'local',
          'null',
          'undefined',
          'true',
          'false',
          'nan',
          'void',
          'constructor',
          'prototype',
        ]
        return !reservedWords.includes(username.toLowerCase())
      },
    }),
    adminPlugin({ ac, roles: { admin: adminRole, user: userRole } }),
    passkey(),
    twoFactor({
      issuer: 'BetterDash',
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          const emailHtml = getMinimalEmailHtml({
            title: 'Your Verification Code',
            username: user.name,
            body: `Your verification code is: **${otp}**`,
            buttonText: 'Login Now',
            link: `${appUrl}/otp`,
          })
          void SendMail({
            to: user.email,
            subject: 'Your verification code',
            text: `Your code is: ${otp}`,
            html: emailHtml,
          })
        },
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: 'encrypted',
      },
    }),
    anonymous({ emailDomainName: 'no-email.betterdash.com' }),
  ],
  advanced: {
    database: { generateId: false },
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
      disableIpTracking: false,
    },
    backgroundTasks: {
      handler: (promise: Promise<any>) => {
        // Platform-specific handler:
        // Vercel: waitUntil(promise)
        // Nitro: Use event.waitUntil if passing event or platform specifics
        void promise.catch(console.error)
      },
    },
  },
})
