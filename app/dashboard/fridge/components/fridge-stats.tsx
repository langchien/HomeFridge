'use client'

import { FridgeItemWithIngredient } from '@/app/actions/fridge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Snowflake, TriangleAlert, X } from 'lucide-react'

interface FridgeStatsProps {
  items: FridgeItemWithIngredient[]
}

export function FridgeStats({ items }: FridgeStatsProps) {
  const totalItems = items.length
  const freshCount = items.filter((i) => i.status === 'FRESH').length
  const expiringCount = items.filter((i) => i.status === 'EXPIRING_SOON').length
  const expiredCount = items.filter((i) => i.status === 'EXPIRED').length
  const freezerCount = items.filter((i) => i.storageLocation === 'FREEZER').length

  // Tỷ lệ % cho progress bar
  const freshPct = totalItems > 0 ? Math.round((freshCount / totalItems) * 100) : 0
  const expiringPct = totalItems > 0 ? Math.round((expiringCount / totalItems) * 100) : 0
  const expiredPct = totalItems > 0 ? Math.round((expiredCount / totalItems) * 100) : 0

  const stats = [
    {
      title: 'Tổng nguyên liệu',
      value: totalItems,
      description: 'Item trong tủ lạnh',
      icon: Package,
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-600 dark:text-blue-400',
      cardClass: 'border-blue-200/60 hover:border-blue-300/60 dark:border-blue-800/60',
    },
    {
      title: 'Sắp hết hạn',
      value: expiringCount,
      description: 'Còn 1–3 ngày',
      icon: TriangleAlert,
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600 dark:text-amber-400',
      cardClass: 'border-amber-200/60 hover:border-amber-300/60 dark:border-amber-800/60',
    },
    {
      title: 'Đã hết hạn',
      value: expiredCount,
      description: 'Cần loại bỏ ngay',
      icon: X,
      iconColor: 'text-red-500',
      valueColor: 'text-red-600 dark:text-red-400',
      cardClass: 'border-red-200/60 hover:border-red-300/60 dark:border-red-800/60',
    },
    {
      title: 'Ngăn đông',
      value: freezerCount,
      description: 'Item trong freezer',
      icon: Snowflake,
      iconColor: 'text-cyan-500',
      valueColor: 'text-cyan-600 dark:text-cyan-400',
      cardClass: 'border-cyan-200/60 hover:border-cyan-300/60 dark:border-cyan-800/60',
    },
  ]

  return (
    <div className='space-y-4'>
      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className={`shadow-sm transition-all duration-200 hover:shadow-md ${stat.cardClass}`}
            >
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
                  {stat.title}
                </CardTitle>
                <Icon className={`size-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</div>
                <p className='mt-1 text-xs text-muted-foreground'>{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Bar tỷ lệ trạng thái */}
      {totalItems > 0 && (
        <div className='rounded-lg border bg-card p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-semibold text-foreground'>Tình trạng tủ lạnh</span>
            <span className='text-xs text-muted-foreground'>{totalItems} nguyên liệu</span>
          </div>

          {/* Bar */}
          <div className='flex h-2.5 w-full overflow-hidden rounded-full bg-muted'>
            {freshPct > 0 && (
              <div
                className='h-full bg-green-500 transition-all duration-500'
                style={{ width: `${freshPct}%` }}
              />
            )}
            {expiringPct > 0 && (
              <div
                className='h-full bg-amber-400 transition-all duration-500'
                style={{ width: `${expiringPct}%` }}
              />
            )}
            {expiredPct > 0 && (
              <div
                className='h-full bg-red-500 transition-all duration-500'
                style={{ width: `${expiredPct}%` }}
              />
            )}
          </div>

          {/* Legend */}
          <div className='mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <span className='inline-block size-2.5 rounded-full bg-green-500' />
              Tươi mới ({freshCount} · {freshPct}%)
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='inline-block size-2.5 rounded-full bg-amber-400' />
              Sắp hết ({expiringCount} · {expiringPct}%)
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='inline-block size-2.5 rounded-full bg-red-500' />
              Hết hạn ({expiredCount} · {expiredPct}%)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
