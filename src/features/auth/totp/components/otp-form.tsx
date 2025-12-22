import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
// import { showSubmittedData } from '@/lib/show-submitted-data'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const formSchema = z.object({
  code: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

type TotpFormProps = React.HTMLAttributes<HTMLFormElement>

export function TotpForm({ className, ...props }: TotpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: { code: '' },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const code = form.watch('code')

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    toast.promise(
      authClient.twoFactor.verifyTotp(
        {
          code: data.code,
          trustDevice: true,
        },
        {
          onSuccess: () => {
            navigate({ to: '/' })
          },
          onError: (ctx) => {
            form.setError('code', { message: ctx.error.message })
            setIsLoading(false)
          },
        },
      ),
      {
        loading: 'Verifying OTP...',
        success: 'OTP Verified!',
        error: (err) => err.error.message || 'Invalid OTP',
      },
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={code.length < 6 || isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Verify'}
        </Button>
      </form>
    </Form>
  )
}
