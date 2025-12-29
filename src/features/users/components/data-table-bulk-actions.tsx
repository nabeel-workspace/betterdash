import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { Mail, Trash2, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps = {
  table: Table<User>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'ban' | 'unban') => {
    const selectedUsers = selectedRows.map((row) => row.original)
    const userIds = selectedUsers
      .map((user) => user.id)
      .filter((id) => {
        if (status === 'ban' && id === session?.user?.id) return false
        return true
      })

    if (status === 'ban' && userIds.length < selectedUsers.length) {
      toast.error('You cannot ban yourself!')
      if (userIds.length === 0) return
    }

    toast.promise(
      Promise.all(
        userIds.map((userId) =>
          status === 'ban'
            ? authClient.admin.banUser(
                { userId, banReason: 'Restricted by administrator' },
                {
                  onError: (ctx) => {
                    throw new Error(ctx.error.message)
                  },
                },
              )
            : authClient.admin.unbanUser(
                { userId },
                {
                  onError: (ctx) => {
                    throw new Error(ctx.error.message)
                  },
                },
              ),
        ),
      ),
      {
        loading: `${status === 'ban' ? 'Banning' : 'Unbanning'} users...`,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
          table.resetRowSelection()
          return `${status === 'ban' ? 'Banned' : 'Unbanned'} ${userIds.length} user${userIds.length > 1 ? 's' : ''}`
        },
        error: (err) =>
          err.message ||
          `Error ${status === 'ban' ? 'banning' : 'unbanning'} users`,
      },
    )
  }

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original)
    toast.promise(sleep(2000), {
      loading: 'Inviting users...',
      success: () => {
        table.resetRowSelection()
        return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
      },
      error: 'Error inviting users',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName="user">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkInvite}
              className="size-8"
              aria-label="Invite selected users"
              title="Invite selected users"
            >
              <Mail />
              <span className="sr-only">Invite selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange('ban')}
              className="size-8"
              aria-label="Ban selected users"
              title="Ban selected users"
            >
              <UserX />
              <span className="sr-only">Ban selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ban selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkStatusChange('unban')}
              className="size-8"
              aria-label="Unban selected users"
              title="Unban selected users"
            >
              <UserCheck />
              <span className="sr-only">Unban selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unban selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected users"
              title="Delete selected users"
            >
              <Trash2 />
              <span className="sr-only">Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
