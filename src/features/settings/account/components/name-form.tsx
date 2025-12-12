import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function NameForm({ name }: { name: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { name },
  })

  function onSubmit(data: AccountFormValues) {
    toast.promise(
      authClient.updateUser(
        { name: data.name },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onResponse: () => {
            setIsLoading(false)
          },
          onError: (error) => {
            const message = error.error.message || error.error.statusText
            throw new Error(message)
          },
        },
      ),
      {
        loading: `Updating name...`,
        success: () => `Name updated successfully!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="border-b py-4">
              <FormLabel>Name</FormLabel>
              <div className="flex flex-row space-x-4 items-end">
                <div className="flex-1 space-y-1">
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      {...field}
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage className="pt-1 text-xs" />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
              <FormDescription>
                This is the name that will be displayed on your profile and in
                emails.
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
