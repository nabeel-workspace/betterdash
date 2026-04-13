import { useNavigate } from '@tanstack/react-router'

import { authClient } from '@/lib/auth.client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  const navigate = useNavigate()

  const handleRestart = async () => {
    await authClient.signOut()
    navigate({ to: '/sign-in' })
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-base tracking-tight">
            Two-factor Authentication
          </CardTitle>
          <CardDescription>
            Please enter the 6-digit verification code we just sent to your
            email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground px-8 text-center text-sm">
            Want to use another method?{' '}
            <button
              onClick={handleRestart}
              className="hover:text-primary underline underline-offset-4"
            >
              Back to sign-in
            </button>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
