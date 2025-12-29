import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { importTasksFn } from '../server/actions'

const route = getRouteApi('/_authenticated/tasks/')

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) =>
        ['text/csv', 'application/vnd.ms-excel'].includes(files?.[0]?.type) ||
        files?.[0]?.name.endsWith('.csv'),
      'Please upload csv format.',
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const queryClient = useQueryClient()
  const search = route.useSearch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const importMutation = useMutation({
    mutationFn: importTasksFn,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', search] })
      toast.success(`${res.count} tasks imported successfully`)
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast.error('Failed to import tasks: ' + error.message)
    },
  })

  const fileRef = form.register('file')

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const file = data.file

    if (file && file[0]) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())
        const [headerLine, ...dataLines] = lines
        const headers = headerLine
          .split(',')
          .map((h) => h.trim().replace(/^"|"$/g, ''))

        const tasks = dataLines.map((line) => {
          const values = line
            .split(',')
            .map((v) => v.trim().replace(/^"|"$/g, ''))
          const task: any = {}
          headers.forEach((header, index) => {
            task[header] = values[index]
          })
          return task
        })

        // Filter valid fields for importTaskSchema
        const validTasks = tasks
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            label: t.label,
            priority: t.priority,
          }))
          .filter((t) => t.title && t.status && t.label && t.priority)

        if (validTasks.length === 0) {
          toast.error('No valid tasks found in the CSV')
          return
        }

        importMutation.mutate({ data: validTasks })
      }
      reader.readAsText(file[0])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className="gap-2 sm:max-w-sm">
        <DialogHeader className="text-start">
          <DialogTitle>Import Tasks</DialogTitle>
          <DialogDescription>
            Import tasks quickly from a CSV file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="task-import-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem className="my-2">
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      {...fileRef}
                      className="h-8 py-0"
                      disabled={importMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button
            type="submit"
            form="task-import-form"
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
