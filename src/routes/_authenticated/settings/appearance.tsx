import { SettingsAppearance } from '@/features/settings/appearance'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
