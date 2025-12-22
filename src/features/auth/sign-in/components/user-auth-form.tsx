import { useEffect, useState } from 'react'
import { IconGithub } from '@/assets/brand-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { HatGlasses, Loader2, LogIn, SquareAsterisk } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'
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

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState<
    'email' | 'social' | 'passkey' | 'anonymous' | null
  >(null)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast.promise(
      authClient.signIn.email(data, {
        onRequest: () => {
          setIsLoading(true)
          setLoading('email')
        },
        onResponse: () => {
          setIsLoading(false)
          setLoading(null)
        },
        onSuccess: (ctx) => {
          if (ctx.data.twoFactorRedirect) {
            navigate({ to: '/totp' })
            return
          }
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })
        },
        onError: (error) => {
          const message = error.error.message || error.error.statusText

          form.setError('email', { message })
          form.setError('password', { message })

          throw new Error(message)
        },
      }),
      {
        loading: 'Signing in...',
        success: () => `Welcome back, ${data.email}!`,
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
            setLoading('social')
          },
          onResponse: () => {
            setIsLoading(false)
            setLoading(null)
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

  useEffect(() => {
    if (
      !PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return
    }

    void authClient.signIn.passkey({ autoFill: true })
  }, [])

  function PasskeySignIn() {
    toast.promise(
      authClient.signIn.passkey(
        {
          // autoFill: true
        },
        {
          onRequest: () => {
            setIsLoading(true)
            setLoading('passkey')
          },
          onResponse: () => {
            setIsLoading(false)
            setLoading(null)
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
        loading: `Signing in with passkey...`,
        success: () => `Welcome back!`,
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  function AnonymousSignIn() {
    toast.promise(
      authClient.signIn.anonymous(
        {},
        {
          onRequest: () => {
            setIsLoading(true)
            setLoading('anonymous')
          },
          onResponse: () => {
            setIsLoading(false)
            setLoading(null)
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
        loading: `Signing in anonymously...`,
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />

        <Button className="mt-2" type="submit" disabled={isLoading}>
          {loading === 'email' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogIn />
          )}
          Sign in
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
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => SocialSignIn('github')}
        >
          {loading === 'social' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <IconGithub className="h-4 w-4" />
          )}
          Continue with GitHub
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => PasskeySignIn()}
        >
          {loading === 'passkey' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <SquareAsterisk className="h-4 w-4" />
          )}
          Continue with Passkey
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => AnonymousSignIn()}
        >
          {loading === 'anonymous' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <HatGlasses className="h-4 w-4" />
          )}
          Continue anonymously
        </Button>
      </form>
    </Form>
  )
}
