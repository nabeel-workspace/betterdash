import { SessionProps } from '@/lib/props'

import { ContentSection } from '../components/content-section'
import { DisplayUsernameForm } from './components/display-username-form'
import { UsernameForm } from './components/username-form'

export function SettingsProfile({ session }: SessionProps) {
  return (
    <ContentSection
      title="Profile"
      desc="This is how others will see you on the site."
    >
      <div className="space-y-6">
        <UsernameForm username={session?.user?.username || ''} />
        <DisplayUsernameForm
          displayUsername={session?.user?.displayUsername || ''}
        />
      </div>
    </ContentSection>
  )
}
