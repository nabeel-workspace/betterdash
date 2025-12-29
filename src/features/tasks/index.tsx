import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

/**
 * Render the Tasks page layout including header, controls, and task UI, with task state provided by TasksProvider.
 *
 * The rendered tree includes a fixed Header with search and profile/theme controls, a Main area with title,
 * primary action buttons and the tasks table, and task-related dialogs — all wrapped by TasksProvider.
 *
 * @returns A JSX element containing the Tasks page layout and its task provider
 */
export function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}