import { Shield, User, Smartphone, ChefHat } from 'lucide-react'

export const roles = [
  {
    label: 'Quản trị viên',
    value: 'ADMIN',
    icon: Shield,
  },
  {
    label: 'Người nội trợ',
    value: 'HOMEMAKER',
    icon: ChefHat,
  },
  {
    label: 'Thành viên',
    value: 'MEMBER',
    icon: User,
  },
  {
    label: 'Thiết bị',
    value: 'DEVICE',
    icon: Smartphone,
  },
]
