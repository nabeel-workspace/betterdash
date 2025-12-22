import { useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => {
    toast.promise(
      authClient.signOut(
        {},
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onResponse: () => {
            setIsLoading(false)
          },
          onSuccess: () => {
            const currentPath = location.href
            navigate({
              to: '/sign-in',
              search: { redirect: currentPath },
              replace: true,
            })
          },
          onError: (error) => {
            const message =
              error.error.message ||
              error.error.statusText ||
              'Failed to sign out.'
            throw new Error(message)
          },
        },
      ),
      {
        loading: 'Signing out...',
        success: 'You have been successfully signed out! Redirecting...',
        error: (err) => err.message || 'Something went wrong',
      },
    )
  }

  return (
    <ConfirmDialog
      isLoading={isLoading}
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  )
}
