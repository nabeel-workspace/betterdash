import { ContentSection } from '../components/content-section'
import { EmailForm } from './components/email-form'
import { NameForm } from './components/name-form'
import { PasskeySettings } from './components/passkey-settings'
import { TwoFactorSwitch } from './components/two-factor-switch'

export type SessionProps = {
  session: {
    session: {
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      expiresAt: Date
      token: string
      ipAddress?: string | null | undefined
      userAgent?: string | null | undefined
      impersonatedBy?: string | null | undefined
    }
    user: {
      id: string
      createdAt: Date
      updatedAt: Date
      email: string
      emailVerified: boolean
      name: string
      image?: string | null | undefined
      banned: boolean | null | undefined
      role?: string | null | undefined
      banReason?: string | null | undefined
      banExpires?: Date | null | undefined
      twoFactorEnabled: boolean | null | undefined
      isAnonymous: boolean | null | undefined
    }
  } | null
}

export function SettingsAccount({ session }: SessionProps) {
  return (
    <ContentSection
      title="Account"
      desc="Update your account settings. Set your preferred language and
          timezone."
    >
      <>
        <NameForm name={session?.user.name || ''} />
        <EmailForm email={session?.user.email || ''} />
        <TwoFactorSwitch session={session} />
        <PasskeySettings session={session} />
      </>
    </ContentSection>
  )
}
