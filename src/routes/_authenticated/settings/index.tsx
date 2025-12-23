import { SettingsProfile } from '@/features/settings/profile'
import { getSession } from '@/server-fn/get-session'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession()
    return { session }
  },
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  return <SettingsProfile session={session} />
}
