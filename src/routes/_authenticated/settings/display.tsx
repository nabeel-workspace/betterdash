import { SettingsDisplay } from '@/features/settings/display'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/display')({
  component: SettingsDisplay,
})
