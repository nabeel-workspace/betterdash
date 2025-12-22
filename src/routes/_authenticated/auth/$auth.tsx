import { ForgotPassword } from '@/features/auth/forgot-password'
import { Otp } from '@/features/auth/otp'
import { ResetPassword } from '@/features/auth/reset-password'
import { SignIn } from '@/features/auth/sign-in'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'
import { SignUp } from '@/features/auth/sign-up'
import { createFileRoute } from '@tanstack/react-router'

import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/auth/$auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useParams()

  const errorMap: Record<string, React.ComponentType> = {
    'sign-in': SignIn,
    'sign-in-2': SignIn2,
    'sign-up': SignUp,
    'forgot-password': ForgotPassword,
    'reset-password': ResetPassword,
    otp: Otp,
  }
  const ErrorComponent = errorMap[auth] || SignIn

  return (
    <>
      <Header fixed className="border-b">
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <div className="flex-1 [&>div]:h-full">
        <ErrorComponent />
      </div>
    </>
  )
}
