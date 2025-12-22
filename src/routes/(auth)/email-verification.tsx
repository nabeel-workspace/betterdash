import { EmailVerification } from '@/features/auth/email-verification'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/email-verification')({
  component: EmailVerification,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: (search.email as string) || undefined,
    }
  },
})
