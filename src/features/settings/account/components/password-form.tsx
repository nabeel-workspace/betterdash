import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth.client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    if (isLoading) return
    setIsLoading(true)

    try {
      await authClient.changePassword(
        {
          newPassword: data.newPassword,
          currentPassword: data.currentPassword,
          revokeOtherSessions: data.revokeOtherSessions,
        },
        {
          onRequest: () => {
            // Loading state handled manually to wrap the whole promise if needed,
            // but here we set it before.
          },
          onSuccess: () => {
            toast.success('Password updated successfully')
            form.reset()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Something went wrong')
          },
        },
      )
    } catch (error) {
      // Ideally error is handled in onError callback of authClient usually,
      // but just in case.
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="pb-0">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Current password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="New password"
                      autoComplete="new-password"
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
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Revoke all other sessions</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This will sign you out of all other devices.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t py-4!">
            <p className="text-sm text-muted-foreground">
              Please use a strong password.
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
