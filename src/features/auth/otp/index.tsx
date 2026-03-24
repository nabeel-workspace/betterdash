import { Link } from '@tanstack/react-router'

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
            Haven't received it?{' '}
            <Link
              to="/sign-in"
              className="hover:text-primary underline underline-offset-4"
            >
              Resend a new code.
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
