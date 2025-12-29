'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

import { type Task } from '../data/schema'
import { deleteTasksFn } from '../server/actions'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const route = getRouteApi('/_authenticated/tasks/')
const CONFIRM_WORD = 'DELETE'

/**
 * Render a confirmation dialog for deleting multiple selected tasks.
 *
 * The dialog requires the user to type "DELETE" to enable the destructive action.
 * Confirming deletes the currently selected tasks, invalidates the tasks cache for the current search, shows a success or error toast, resets table selection, closes the dialog, and clears the confirmation input.
 *
 * @param table - Table instance used to read selected rows and reset row selection after successful deletion
 * @returns The confirmation dialog element that handles multi-delete flow for selected tasks
 */
export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const search = route.useSearch()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const deleteMutation = useMutation({
    mutationFn: deleteTasksFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', search] })
      toast.success(
        `Deleted ${selectedRows.length} ${
          selectedRows.length > 1 ? 'tasks' : 'task'
        } successfully`,
      )
      table.resetRowSelection()
      onOpenChange(false)
      setValue('')
    },
    onError: (error) => {
      toast.error('Failed to delete tasks: ' + error.message)
    },
  })

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    const ids = selectedRows.map((row) => (row.original as Task).id)
    deleteMutation.mutate({ data: { ids } })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      isLoading={deleteMutation.isPending}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'tasks' : 'task'}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected tasks? <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}