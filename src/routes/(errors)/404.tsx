import { NotFoundError } from '@/features/errors/not-found-error'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(errors)/404')({
  component: NotFoundError,
})
