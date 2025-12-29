import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

import { priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { getTasksByIdsFn, updateTasksFn } from '../server/actions'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

const route = getRouteApi('/_authenticated/tasks/')

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const queryClient = useQueryClient()
  const search = route.useSearch()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const bulkUpdateMutation = useMutation({
    mutationFn: updateTasksFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', search] })
      const count = variables.data.ids.length
      const field = variables.data.data.status ? 'status' : 'priority'
      const value = variables.data.data.status || variables.data.data.priority
      toast.success(
        `Updated ${field} to "${value}" for ${count} ${
          count > 1 ? 'tasks' : 'task'
        } successfully`,
      )
      table.resetRowSelection()
    },
    onError: (error) => {
      toast.error('Failed to update tasks: ' + error.message)
    },
  })

  const handleBulkStatusChange = (status: string) => {
    const ids = selectedRows.map((row) => (row.original as Task).id)
    bulkUpdateMutation.mutate({
      data: {
        ids,
        data: { status },
      },
    })
  }

  const handleBulkPriorityChange = (priority: string) => {
    const ids = selectedRows.map((row) => (row.original as Task).id)
    bulkUpdateMutation.mutate({
      data: {
        ids,
        data: { priority },
      },
    })
  }

  const handleBulkExport = () => {
    const ids = selectedRows.map((row) => (row.original as Task).id)

    toast.promise(
      (async () => {
        const tasks = await getTasksByIdsFn({ data: { ids } })

        const headers = ['id', 'code', 'title', 'status', 'label', 'priority']
        const csvData = tasks.map((task) =>
          headers
            .map((header) => {
              const value = task[header as keyof (typeof tasks)[0]] || ''
              const stringValue =
                typeof value === 'string' ? value : JSON.stringify(value)
              return `"${stringValue.replace(/"/g, '""')}"`
            })
            .join(','),
        )

        const csvContent = [headers.join(','), ...csvData].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute(
          'download',
          `tasks-export-${new Date().toISOString().split('T')[0]}.csv`,
        )
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        table.resetRowSelection()
        return `Exported ${tasks.length} task${tasks.length > 1 ? 's' : ''} successfully.`
      })(),
      {
        loading: 'Preparing export...',
        success: (msg) => msg,
        error: 'Failed to export tasks.',
      },
    )
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName="task">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Update status"
                  title="Update status"
                >
                  <CircleArrowUp />
                  <span className="sr-only">Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className="text-muted-foreground size-4" />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Update priority"
                  title="Update priority"
                >
                  <ArrowUpDown />
                  <span className="sr-only">Update priority</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update priority</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                defaultValue={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
              >
                {priority.icon && (
                  <priority.icon className="text-muted-foreground size-4" />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBulkExport()}
              className="size-8"
              aria-label="Export tasks"
              title="Export tasks"
            >
              <Download />
              <span className="sr-only">Export tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export tasks</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected tasks"
              title="Delete selected tasks"
            >
              <Trash2 />
              <span className="sr-only">Delete selected tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
