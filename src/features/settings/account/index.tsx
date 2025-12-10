import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

import { TwoFactorSwitch } from './components/two-factor-switch'

export function SettingsAccount() {
  return (
    <ContentSection
      title="Account"
      desc="Update your account settings. Set your preferred language and
          timezone."
    >
      <>
        <AccountForm />
        <TwoFactorSwitch />
      </>
    </ContentSection>
  )
}
