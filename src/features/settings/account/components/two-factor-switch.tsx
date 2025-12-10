import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Copy } from 'lucide-react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { PasswordInput } from '@/components/password-input'
import { Separator } from '@/components/ui/separator'

export function TwoFactorSwitch() {
  const { data: session } = authClient.useSession()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [step, setStep] = useState<'password' | 'qr' | 'backup'>('password')
  const [isLoading, setIsLoading] = useState(false)

  const resetState = () => {
    setPassword('')
    setTotpUri(null)
    setVerificationCode('')
    setBackupCodes([])
    setStep('password')
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetState()
    }
  }

  const handleEnable2FA = async () => {
    if (!password) {
      toast.error('Password is required')
      return
    }

    setIsLoading(true)
    try {
      const res = await authClient.twoFactor.enable({
        password,
      })
      if (res.data?.totpURI) {
        setBackupCodes(res.data.backupCodes)
        setTotpUri(res.data.totpURI)
        setStep('qr')
      } else {
        toast.error('Failed to generate TOTP URI')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to enable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (verificationCode.length < 6) return
    setIsLoading(true)
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
        trustDevice: true,
      })
      if (res.data?.token) {
        setStep('backup')
        toast.success('2FA Enabled Successfully')
      } else {
        toast.error('Failed to enable 2FA')
      }
    } catch (e: any) {
      if (e?.code === 'OTP_HAS_EXPIRED' || e?.message === 'OTP has expired') {
        toast.error('The code has expired. Please wait for a new one.')
      } else {
        toast.error(e.message || 'Invalid Code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  if (session.user.twoFactorEnabled && step !== 'backup') {
    return <TwoFactorDisable />
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 mt-4">
      <div className="space-y-0.5">
        <Label className="text-base">Two-factor Authentication</Label>
        <p className="text-muted-foreground text-sm">
          Add an extra layer of security to your account.
        </p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>Enable 2FA</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {step === 'password' && 'Please enter your password to continue.'}
              {step === 'qr' && 'Scan the QR code with your authenticator app.'}
              {step === 'backup' && 'Save these backup codes in a safe place.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'password' && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <PasswordInput
                  id="password"
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 'qr' && totpUri && (
            <div className="flex flex-col items-center gap-4 ">
              <img
                src={`https://quickchart.io/chart?cht=qr&chs=320x320&chl=${encodeURIComponent(
                  totpUri,
                )}`}
                alt="QR Code"
                className="aspect-square w-80"
              />

              <Separator />
              {totpUri ? (
                <p className="text-center text-sm">
                  If you can't scan the QR code, <br /> you can use the secret
                  key below:
                  <br />
                  {/* i want text brack if secret key is too long  */}
                  <span className="text-xs">
                    {
                      totpUri
                        ?.split('otpauth://totp/')[1]
                        ?.split('?')[1]
                        ?.split('&')[0]
                        ?.split('=')[1]
                    }
                  </span>
                </p>
              ) : null}

              <Separator />

              <div className="flex flex-col items-center gap-2 justify-center">
                <Label htmlFor="otp" className="text-center">
                  Enter Verification Code
                </Label>
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center border p-2 rounded text-sm font-mono"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join(' | '))
                  toast.success('Copied to clipboard')
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Codes
              </Button>
            </div>
          )}

          <DialogFooter>
            {step === 'password' && (
              <Button
                className="w-full"
                onClick={handleEnable2FA}
                disabled={isLoading || !password}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            )}
            {step === 'qr' && (
              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={isLoading || verificationCode.length < 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            )}
            {step === 'backup' && (
              <Button
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function TwoFactorDisable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const resetState = () => {
    setPassword('')
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetState()
    }
  }

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error('Password is required')
      return
    }

    setIsLoading(true)
    try {
      await authClient.twoFactor.disable({ password })
      toast.success('2FA Disabled')
    } catch (e: any) {
      toast.error(e.message || 'Failed to enable 2FA')
    } finally {
      handleOpenChange(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 mt-4">
      <div className="space-y-0.5">
        <Label className="text-base">Two-factor Authentication</Label>
        <p className="text-muted-foreground text-sm">
          Two-factor authentication is enabled.
        </p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="destructive" onClick={handleDisable2FA}>
            Disable 2FA
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Please enter your password to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <PasswordInput
                id="password"
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isLoading || !password}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
