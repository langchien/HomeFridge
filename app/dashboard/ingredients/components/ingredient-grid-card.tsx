'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import Image from 'next/image'
import type { IngredientWithRelations } from './columns'

interface IngredientGridCardProps {
  item: IngredientWithRelations
  onEdit: (item: IngredientWithRelations) => void
}

export function IngredientGridCard({ item, onEdit }: IngredientGridCardProps) {
  return (
    <div
      className={[
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm',
        'border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
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
      </div>

      {/* Nội dung */}
      <div className='flex flex-1 flex-col gap-2 p-3'>
        {/* Tên */}
        <p className='line-clamp-2 min-h-[40px] leading-snug font-semibold text-foreground'>
          {item.name}
        </p>

        {/* Category */}
        <div className='flex items-center justify-between gap-1'>
          <Badge
            variant='outline'
            className='flex h-5 items-center gap-0.5 px-1.5 py-0 text-xs font-normal'
          >
            {item.category?.icon && <span className='shrink-0'>{item.category.icon}</span>}
            <span className='truncate'>{item.category?.name}</span>
          </Badge>
        </div>

        {/* Nút chỉnh sửa */}
        <Button
          size='sm'
          variant='outline'
          className='mt-auto h-7 w-full gap-1.5 text-sm font-medium transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
          onClick={() => onEdit(item)}
        >
          <Edit className='size-3' />
          Chỉnh sửa
        </Button>
      </div>
    </div>
  )
}
