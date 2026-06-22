'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import type { FridgeItemWithRelations } from './columns'

const locationMap: Record<string, string> = {
  FREEZER: 'Tủ đông',
  CHILLER: 'Ngăn mát',
  FRIDGE_SHELF: 'Ngăn kệ',
  VEGETABLE_DRAWER: 'Ngăn rau củ',
  DOOR_SHELF: 'Ngăn cửa',
  PANTRY: 'Tủ bếp',
}

const locationIconMap: Record<string, string> = {
  FREEZER: '🧊',
  CHILLER: '❄️',
  FRIDGE_SHELF: '🗄️',
  VEGETABLE_DRAWER: '🥬',
  DOOR_SHELF: '🚪',
  PANTRY: '🍳',
}

interface FridgeGridCardProps {
  item: FridgeItemWithRelations
  onViewDetail: (item: FridgeItemWithRelations) => void
}

export function FridgeGridCard({ item, onViewDetail }: FridgeGridCardProps) {
  const now = new Date()
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const isExpired = expiryDate ? expiryDate < now : false
  const isExpiringSoon = expiryDate ? expiryDate >= now && expiryDate < threeDaysFromNow : false

  const expiryStatus = isExpired ? 'expired' : isExpiringSoon ? 'expiring' : 'valid'

  return (
    <div
      className={[
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isExpired
          ? 'border-destructive/30'
          : isExpiringSoon
            ? 'border-amber-400/40'
            : 'border-border',
      ].join(' ')}
    >
      {/* Ảnh */}
      <div className='relative aspect-[4/3] w-full overflow-hidden bg-secondary/30'>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-4xl'>
            {item.category?.icon || '🍽️'}
          </div>
        )}

        {/* Badge trạng thái hạn */}
        {expiryStatus !== 'valid' && (
          <div className='absolute top-2 right-2'>
            {isExpired ? (
              <Badge variant='destructive' className='text-[10px] font-semibold shadow-sm'>
                Hết hạn
              </Badge>
            ) : (
              <Badge className='border-amber-400 bg-amber-400/90 text-[10px] font-semibold text-white shadow-sm'>
                Sắp hết
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className='flex flex-1 flex-col gap-2 p-3'>
        {/* Tên */}
        <p className='line-clamp-1 text-sm leading-tight font-semibold text-foreground'>
          {item.name}
        </p>

        {/* Số lượng + Category */}
        <div className='flex items-center justify-between gap-1'>
          <span className='text-xs font-medium text-muted-foreground'>
            {item.quantity} {item.unit}
          </span>
          <Badge
            variant='outline'
            className='flex h-5 max-w-[80px] items-center gap-0.5 truncate px-1.5 py-0 text-[10px] font-normal'
          >
            {item.category?.icon && <span className='shrink-0'>{item.category.icon}</span>}
            <span className='truncate'>{item.category?.name}</span>
          </Badge>
        </div>

        {/* Vị trí */}
        <p className='flex items-center gap-1 text-[11px] text-muted-foreground'>
          <span>{locationIconMap[item.location] || '📦'}</span>
          <span className='truncate'>{locationMap[item.location] || item.location}</span>
        </p>

        {/* Hạn sử dụng */}
        {expiryDate ? (
          <p
            className={[
              'text-[11px] font-medium',
              isExpired
                ? 'text-destructive'
                : isExpiringSoon
                  ? 'text-amber-500'
                  : 'text-muted-foreground',
            ].join(' ')}
          >
            HSD: {expiryDate.toLocaleDateString('vi-VN')}
          </p>
        ) : (
          <p className='text-[11px] text-muted-foreground'>HSD: Không có</p>
        )}

        {/* Nút xem chi tiết */}
        <Button
          size='sm'
          variant='outline'
          className='mt-auto h-7 w-full gap-1.5 text-[11px] font-medium transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
          onClick={() => onViewDetail(item)}
        >
          <Eye className='size-3' />
          Xem chi tiết
        </Button>
      </div>
    </div>
  )
}
