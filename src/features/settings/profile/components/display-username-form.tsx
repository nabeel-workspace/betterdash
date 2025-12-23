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

const displayUsernameFormSchema = z.object({
  displayUsername: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
})

type DisplayUsernameFormValues = z.infer<typeof displayUsernameFormSchema>

export function DisplayUsernameForm({
  displayUsername,
}: {
  displayUsername: string
}) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<DisplayUsernameFormValues>({
    resolver: zodResolver(displayUsernameFormSchema),
    defaultValues: { displayUsername },
  })

  function onSubmit(data: DisplayUsernameFormValues) {
    toast.promise(
      authClient.updateUser(
        { displayUsername: data.displayUsername },
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="pb-0">
          <CardHeader>
            <CardTitle>Display Username</CardTitle>
            <CardDescription>
              Please enter your full username, or a display username you are
              comfortable with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="displayUsername"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Your display username"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pt-1 text-xs" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t py-4!">
            <p className="text-sm text-muted-foreground">
              Please use 32 characters at maximum.
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
