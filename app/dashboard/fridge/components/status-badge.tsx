'use client'

import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      label: string
      variant: 'outline'
      className: string
    }
  > = {
    FRESH: {
      label: 'Tươi',
      variant: 'outline',
      className:
        'border-green-300 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    },
    EXPIRING_SOON: {
      label: 'Sắp hết',
      variant: 'outline',
      className:
        'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    EXPIRED: {
      label: 'Hết hạn',
      variant: 'outline',
      className: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    },
  }

  const config = statusConfig[status] || statusConfig.FRESH

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
