'use client'

import { FridgeGridCard } from './fridge-grid-card'
import type { FridgeItemWithRelations } from './columns'
import { PackageOpen } from 'lucide-react'

interface FridgeGridViewProps {
  items: FridgeItemWithRelations[]
  onViewDetail: (item: FridgeItemWithRelations) => void
}

export function FridgeGridView({ items, onViewDetail }: FridgeGridViewProps) {
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-center'>
        <PackageOpen className='size-10 text-muted-foreground/50' />
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Không có thực phẩm nào</p>
          <p className='mt-0.5 text-xs text-muted-foreground/70'>
            Thử thay đổi bộ lọc hoặc thêm thực phẩm mới!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4'>
      {items.map((item) => (
        <FridgeGridCard key={item.id} item={item} onViewDetail={onViewDetail} />
      ))}
    </div>
  )
}
