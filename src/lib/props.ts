import { authClient } from './auth-client'

export type SessionProps = {
  session: typeof authClient.$Infer.Session | null
}
