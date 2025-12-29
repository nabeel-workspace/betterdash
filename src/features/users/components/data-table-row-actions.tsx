import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const queryClient = useQueryClient()
  const { setOpen, setCurrentRow } = useUsers()
  const { data: session } = authClient.useSession()

  const handleRoleChange = async (value: string) => {
    const user = row.original

    if (session?.user?.id === user.id) {
      toast.error('You cannot change your role!')
      return
    }

    toast.promise(
      authClient.admin.updateUser(
        {
          userId: user.id,
          data: {
            role: value,
          },
        },
        {
          onError: (ctx) => {
            throw new Error(ctx.error.message)
          },
        },
      ),
      {
        loading: 'Updating user role...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
          return `User ${user.name} role updated successfully!`
        },
        error: (err) => err.message || 'Failed to update user role',
      },
    )
  }

  const handleStatusChange = async (value: string) => {
    const user = row.original

    if (value === 'band') {
      if (session?.user?.id === user.id) {
        toast.error('You cannot ban yourself!')
        return
      }

      toast.promise(
        authClient.admin.banUser({
          userId: user.id,
          banReason: 'Restricted by administrator',
        }),
        {
          loading: 'Banning user...',
          success: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            return `User ${user.name} has been banned.`
          },
          error: (err) => err.message || 'Failed to ban user',
        },
      )
    } else if (value === 'unband') {
      toast.promise(
        authClient.admin.unbanUser({
          userId: user.id,
        }),
        {
          loading: 'Unbanning user...',
          success: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            return `User ${user.name} has been unbanned.`
          },
          error: (err) => err.message || 'Failed to unban user',
        },
      )
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Role</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.original.role || 'user'}
                onValueChange={handleRoleChange}
              >
                <DropdownMenuRadioItem key="user" value="user">
                  User
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem key="admin" value="admin">
                  Admin
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={row.original.banned ? 'band' : 'unband'}
                onValueChange={handleStatusChange}
              >
                <DropdownMenuRadioItem key="band" value="band">
                  Ban
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem key="unband" value="unband">
                  Unban
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className="text-red-500!"
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
