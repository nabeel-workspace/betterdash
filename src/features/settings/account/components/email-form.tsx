import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="pb-0">
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Enter the email addresses you want to use to log in with
              BetterDash. Your primary email will be used for account-related
              notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Your email"
                      {...field}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage className="pt-1 text-xs" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t py-4!">
            <p className="text-sm text-muted-foreground">
              Emails must be verified to be able to login with them or be used
              as primary email.
            </p>
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
