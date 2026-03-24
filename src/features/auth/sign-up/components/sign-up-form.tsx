import { useEffect, useState } from 'react'
import { IconGithub } from '@/assets/brand-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth.client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name'),
    username: z
      .string()
      .min(1, 'Please enter your username.')
      .min(3, 'Username must be at least 3 characters.')
      .max(30, 'Username must not be longer than 30 characters.'),
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
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
        usernameValue.length > 30
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

  const areFieldsDisabled =
    isLoading || !isUsernameAvailable || isCheckingUsername

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.promise(
      authClient.signUp.email(data, {
        onRequest: () => {
          setIsLoading(true)
        },
        onResponse: () => {
          setIsLoading(false)
        },
        onSuccess: () => {
          const targetPath = '/email-verification'
          navigate({
            to: targetPath,
            replace: true,
            search: { email: data.email },
          })
        },
        onError: (error) => {
          const message = error.error.message || error.error.statusText

          form.setError('email', { message })
          form.setError('password', { message })
          form.setError('confirmPassword', { message })

          throw new Error(message)
        },
      }),
      {
        loading: 'Signing up...',
        success: () => `Welcome, ${data.email}!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  function SocialSignIn(provider: 'github') {
    toast.promise(
      authClient.signIn.social(
        { provider },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onResponse: () => {
            setIsLoading(false)
          },
          onSuccess: () => {
            navigate({ to: '/', replace: true })
          },
          onError: (error) => {
            const message = error.error.message || error.error.statusText
            throw new Error(message)
          },
        },
      ),
      {
        loading: `Signing in with ${provider}...`,
        success: () => `Welcome back!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="username"
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
                    {!isCheckingUsername && isUsernameAvailable === true && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {!isCheckingUsername && isUsernameAvailable === false && (
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={areFieldsDisabled}
                  placeholder="Shadcn"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  disabled={areFieldsDisabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={areFieldsDisabled}
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={areFieldsDisabled}
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={areFieldsDisabled || isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => SocialSignIn('github')}
        >
          <IconGithub className="h-4 w-4" /> GitHub
        </Button>
      </form>
    </Form>
  )
}
