import { Shield, Users } from 'lucide-react'

export const roles = [
  {
    label: 'Admin',
    value: 'admin',
    icon: Shield,
  },
  {
    label: 'User',
    value: 'user',
    icon: Users,
  },
] as const
