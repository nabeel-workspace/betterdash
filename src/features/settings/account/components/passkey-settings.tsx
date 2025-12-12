import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Fingerprint } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { SessionProps } from '..'

interface Passkey {
  id: string
  name?: string
  createdAt: Date
}

export function PasskeySettings({ session }: SessionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [passkeyName, setPasskeyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const fetchPasskeys = async () => {
    try {
      const res = await authClient.passkey.listUserPasskeys()
      if (res.data) {
        setPasskeys(res.data as unknown as Passkey[])
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchPasskeys()
    }
  }, [session])

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error('Passkey name is required')
      return
    }

    setIsLoading(true)
    try {
      await authClient.passkey.addPasskey({
        name: passkeyName,
      })
      toast.success('Passkey added successfully')
      setIsDialogOpen(false)
      setPasskeyName('')
      fetchPasskeys()
    } catch (e: any) {
      toast.error(e.message || 'Failed to add passkey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePasskey = async (id: string) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this passkey?',
    )
    if (!confirm) return

    try {
      await authClient.passkey.deletePasskey({ id })
      toast.success('Passkey deleted successfully')
      fetchPasskeys()
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete passkey')
    }
  }

  if (!session) return null

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Passkeys</Label>
          <p className="text-muted-foreground text-sm">
            Manage your passkeys for passwordless sign-in.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Passkey
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Passkey</DialogTitle>
              <DialogDescription>
                Enter a name for your passkey to easily identify it later.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="passkey-name">Passkey Name</Label>
                <Input
                  id="passkey-name"
                  value={passkeyName}
                  placeholder="e.g. MacBook Pro, iPhone"
                  onChange={(e) => setPasskeyName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleAddPasskey}
                disabled={isLoading || !passkeyName}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Passkey
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : passkeys?.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passkeys.map((passkey) => (
                <TableRow key={passkey.id}>
                  <TableCell>
                    <Fingerprint className="h-4 w-4 text-muted-foreground inline-flex mr-2" />
                    {passkey.name || 'Unnamed Passkey'}
                  </TableCell>
                  <TableCell>
                    {passkey.createdAt
                      ? format(new Date(passkey.createdAt), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePasskey(passkey.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-4 text-sm text-muted-foreground bg-muted/50 rounded-md border border-dashed">
          No passkeys added yet.
        </div>
      )}
    </div>
  )
}
