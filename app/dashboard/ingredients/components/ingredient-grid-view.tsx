'use client'

import { PackageOpen } from 'lucide-react'
import type { IngredientWithRelations } from './columns'
import { IngredientGridCard } from './ingredient-grid-card'

interface IngredientGridViewProps {
  items: IngredientWithRelations[]
  onEdit: (item: IngredientWithRelations) => void
}

export function IngredientGridView({ items, onEdit }: IngredientGridViewProps) {
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card py-16 text-center'>
        <PackageOpen className='size-10 text-muted-foreground/50' />
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Không có nguyên liệu nào</p>
          <p className='mt-0.5 text-muted-foreground/70'>
            Thử thay đổi bộ lọc hoặc thêm nguyên liệu mới!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4'>
      {items.map((item) => (
        <IngredientGridCard key={item.id} item={item} onEdit={onEdit} />
      ))}
    </div>
  )
}
