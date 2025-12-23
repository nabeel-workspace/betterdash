import { createAccessControl } from 'better-auth/plugins/access'

export const statement = {
  user: [
    'create',
    'list',
    'update',
    'delete',
    'ban',
    'unban',
    'set-role',
    'set-password',
    'impersonate',
    'stop-impersonating',
    'list-sessions',
    'revoke-session',
    'revoke-sessions',
  ],
  team: ['add-member', 'remove-member'],
} as const

export const ac = createAccessControl<typeof statement>(statement)

export const userRole = ac.newRole({
  user: [],
  team: [],
})

export const adminRole = ac.newRole({
  user: [
    'create',
    'list',
    'update',
    'delete',
    'ban',
    'unban',
    'set-role',
    'set-password',
    'impersonate',
    'stop-impersonating',
    'list-sessions',
    'revoke-session',
    'revoke-sessions',
  ],
  team: ['add-member', 'remove-member'],
})
