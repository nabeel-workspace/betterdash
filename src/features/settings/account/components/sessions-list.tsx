import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Laptop, Loader2, Monitor, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { SessionProps } from '@/lib/props'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type UserSession = {
  id: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  expiresAt: Date
  isCurrent: boolean
}

export function SessionsList({ session }: SessionProps) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRevokingOthers, setIsRevokingOthers] = useState(false)

  const fetchSessions = async () => {
    try {
      const { data, error } = await authClient.listSessions()

      if (error) {
        throw error
      }

      if (data) {
        setSessions(
          data.map((s) => ({
            id: s.id,
            ipAddress: s.ipAddress ?? null,
            userAgent: s.userAgent ?? null,
            createdAt: s.createdAt,
            expiresAt: s.expiresAt,
            isCurrent: s.id === session?.session.id,
          })),
        )
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast.error('Failed to load active sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSessions()
    }
  }, [session])

  //   handling revoke single session requer session token
  //   const handleRevoke = async (token: string) => {
  //     try {
  //       await authClient.revokeSession({
  //         token,
  //       })
  //       toast.success('Session revoked')
  //       setSessions((prev) => prev.filter((s) => s.id !== token))
  //     } catch (error) {
  //       toast.error('Failed to revoke session')
  //     }
  //   }

  const handleRevokeOthers = async () => {
    setIsRevokingOthers(true)
    try {
      await authClient.revokeOtherSessions()
      toast.success('All other sessions revoked')
      setSessions((prev: UserSession[]) =>
        prev.filter((s: UserSession) => s.isCurrent),
      )
    } catch (error) {
      toast.error('Failed to revoke other sessions')
    } finally {
      setIsRevokingOthers(false)
    }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobi') || ua.includes('android'))
      return <Smartphone className="h-4 w-4" />
    if (ua.includes('mac') || ua.includes('windows') || ua.includes('linux'))
      return <Laptop className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceName = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Device'
    if (userAgent.includes('Windows')) return 'Windows PC'
    if (userAgent.includes('Mac OS X')) return 'macOS'
    if (userAgent.includes('Android')) return 'Android Device'
    if (userAgent.includes('iPhone')) return 'iPhone'
    if (userAgent.includes('Linux')) return 'Linux PC'
    return 'Desktop Browser'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage the devices where you are currently logged in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            These are the devices that have recently logged into your account.
          </CardDescription>
        </div>
        {sessions.filter((s: UserSession) => !s.isCurrent).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeOthers}
            disabled={isRevokingOthers}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isRevokingOthers && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Revoke Others
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No other active sessions found.
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {sessions.map((s: UserSession) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">
                    {getDeviceIcon(s.userAgent)}
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {getDeviceName(s.userAgent)}
                      {s.isCurrent && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1"
                        >
                          Current Session
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress || 'Unknown IP'} • Last active{' '}
                      {format(new Date(s.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                {/* {!s.isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRevoke(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Revoke session</span>
                  </Button>
                )} */}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
