import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
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

const usernameFormSchema = z.object({
  username: z
    .string()
    .min(1, 'Please enter your username.')
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
})

type UsernameFormValues = z.infer<typeof usernameFormSchema>

export function UsernameForm({ username }: { username: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: { username },
    mode: 'onChange',
  })

  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null)

  const usernameValue = form.watch('username')

  useEffect(() => {
    const checkUsername = async () => {
      if (
        !usernameValue ||
        usernameValue.length < 3 ||
        usernameValue.length > 30 ||
        usernameValue === username
      ) {
        setIsUsernameAvailable(null)
        return
      }

      setIsCheckingUsername(true)
      try {
        const { data, error } = await authClient.isUsernameAvailable({
          username: usernameValue,
        })
        if (error) {
          setIsUsernameAvailable(false)
          return
        }
        setIsUsernameAvailable(data?.available ?? false)
      } catch (error) {
        console.error('Error checking username:', error)
        setIsUsernameAvailable(false)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    const timer = setTimeout(checkUsername, 500)
    return () => clearTimeout(timer)
  }, [usernameValue])

  const isUnchanged = usernameValue === username
  const areFieldsDisabled =
    isLoading ||
    isCheckingUsername ||
    isUsernameAvailable === false ||
    isUnchanged

  function onSubmit(data: UsernameFormValues) {
    toast.promise(
      authClient.updateUser(
        { username: data.username },
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
        loading: `Updating username...`,
        success: () => `Username updated successfully!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="pb-0">
          <CardHeader>
            <CardTitle>Username</CardTitle>
            <CardDescription>
              This is your URL namespace within BetterDash.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Your username"
                        disabled={isLoading}
                        autoComplete="username"
                        {...field}
                        className={cn(
                          isUsernameAvailable === true && 'border-green-500',
                          isUsernameAvailable === false && 'border-red-500',
                        )}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        {isCheckingUsername && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!isCheckingUsername &&
                          isUsernameAvailable === true && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        {!isCheckingUsername &&
                          isUsernameAvailable === false && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                      </div>
                    </div>
                  </FormControl>
                  {isUsernameAvailable === false && !fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      Username is already taken.
                    </p>
                  )}
                  <FormMessage className="pt-1 text-xs" />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t py-4!">
            <p className="text-sm text-muted-foreground">
              Please use 30 characters at maximum.
            </p>
            <Button
              type="submit"
              disabled={areFieldsDisabled}
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
