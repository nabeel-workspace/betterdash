import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'
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

const accountFormSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function EmailForm({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { email },
  })

  function onSubmit(data: AccountFormValues) {
    toast.promise(
      authClient.changeEmail(
        { newEmail: data.email },
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
        loading: `Updating email...`,
        success: () => `Email updated successfully!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="border-b py-4">
              <FormLabel>Email</FormLabel>
              <div className="flex flex-row space-x-4 items-end">
                <div className="flex-1 space-y-1">
                  <FormControl>
                    <Input
                      placeholder="Your email"
                      {...field}
                      autoComplete="email"
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
                This is the email that will be used for authentication and
                notifications.
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
