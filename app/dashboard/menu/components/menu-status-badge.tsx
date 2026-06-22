'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateMenuStatusAction } from '@/app/actions/menu'
import { toast } from 'sonner'
import type { MenuStatus } from '@/generated/prisma/client'
import { ChevronDown, Loader2 } from 'lucide-react'

const STATUS_CONFIG: Record<
  MenuStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  PLANNED: {
    label: 'Đã lên kế hoạch',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  },
  COOKING: {
    label: 'Đang nấu',
    variant: 'default',
    className: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  },
  DONE: {
    label: 'Hoàn thành',
    variant: 'default',
    className: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    variant: 'destructive',
    className: 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30',
  },
}

const STATUS_TRANSITIONS: Record<MenuStatus, MenuStatus[]> = {
  PLANNED: ['COOKING', 'CANCELLED'],
  COOKING: ['DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: ['PLANNED'],
}

interface MenuStatusBadgeProps {
  menuId: string
  status: MenuStatus
}

export function MenuStatusBadge({ menuId, status }: MenuStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<MenuStatus>(status)
  const [isPending, startTransition] = useTransition()

  const config = STATUS_CONFIG[currentStatus]
  const nextStatuses = STATUS_TRANSITIONS[currentStatus]

  const handleStatusChange = (newStatus: MenuStatus) => {
    startTransition(async () => {
      const result = await updateMenuStatusAction(menuId, newStatus)
      if (result.success) {
        setCurrentStatus(newStatus)
        toast.success(`Đã chuyển sang: ${STATUS_CONFIG[newStatus].label}`)
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  if (nextStatuses.length === 0) {
    return (
      <Badge variant='outline' className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant='outline'
          className={`${config.className} cursor-pointer gap-1 pr-1 transition-opacity select-none hover:opacity-80`}
        >
          {isPending ? <Loader2 className='h-3 w-3 animate-spin' /> : null}
          {config.label}
          <ChevronDown className='h-3 w-3' />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {nextStatuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)} disabled={isPending}>
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${
                s === 'COOKING'
                  ? 'bg-amber-500'
                  : s === 'DONE'
                    ? 'bg-emerald-500'
                    : s === 'CANCELLED'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
              }`}
            />
            {STATUS_CONFIG[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
