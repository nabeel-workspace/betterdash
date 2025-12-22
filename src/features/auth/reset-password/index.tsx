import { Link } from '@tanstack/react-router'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword({ token }: { token?: string }) {
  return (
    <AuthLayout>
      {!token ? (
        <Alert variant={'destructive'}>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            Invalid or missing reset token. Please try again.{' '}
            <Link
              to="/forgot-password"
              className="hover:text-primary underline underline-offset-4"
            >
              Forgot Password
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your registered email and <br /> we will send you a link to
            reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token ?? ''} disabled={!token} />
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground mx-auto px-8 text-center text-sm text-balance">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="hover:text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
