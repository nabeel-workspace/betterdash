import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { AuthLayout } from '../auth-layout'

export function EmailVerification() {
  const search = useSearch({ from: '/(auth)/email-verification' }) as {
    email?: string
  }
  const email = search.email || 'your email'
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!search.email) {
      toast.error('No email found to resend verification.')
      return
    }

    await authClient.sendVerificationEmail(
      {
        email: search.email,
        callbackURL: '/',
      },
      {
        onRequest: () => {
          setIsResending(true)
        },
        onResponse: () => {
          setIsResending(false)
        },
        onSuccess: () => {
          toast.success('Verification email sent!')
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || 'Failed to resend verification email.',
          )
        },
      },
    )
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription>
            We've sent a verification link to <br />
            <span className="font-semibold text-foreground">{email}</span>.
            Please check your inbox.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="rounded-md border p-4">
            <div className="flex items-start gap-4">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Check your inbox
                </p>
                <p className="text-muted-foreground text-sm">
                  Click the link in the email to verify your account and get
                  started.
                </p>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Mail App
            </a>
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <p className="text-muted-foreground px-8 text-center text-sm">
            Didn't receive the email?{' '}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-primary hover:underline font-medium focus:outline-none transition-colors disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1"
            >
              {isResending && <Loader2 className="h-3 w-3 animate-spin" />}
              Resend verification
            </button>
          </p>
          <Link
            to="/sign-in"
            className="text-muted-foreground hover:text-primary text-center text-sm underline underline-offset-4 transition-colors"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
