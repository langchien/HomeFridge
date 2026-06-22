'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DailyMenuCard } from './daily-menu-card'
import { AddMenuItemDialog } from './add-menu-item-dialog'
import { CalendarDays, Plus, Search, SlidersHorizontal } from 'lucide-react'
import type { DailyMenu, DailyMenuItem, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import type { RecipeWithIngredients } from './recipe-form-dialog'

type MenuItemWithRecipe = DailyMenuItem & {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}
type DailyMenuWithItems = DailyMenu & { items: MenuItemWithRecipe[] }

interface DailyMenuListProps {
  menus: DailyMenuWithItems[]
  recipes: RecipeWithIngredients[]
}

export function DailyMenuList({ menus, recipes }: DailyMenuListProps) {
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Lọc menu theo tìm kiếm (ngày)
  const filtered = menus.filter((m) => {
    if (!search) return true
    const dateStr = new Date(m.date).toLocaleDateString('vi-VN')
    return dateStr.includes(search)
  })

  // Sắp xếp mới nhất lên đầu
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className='flex flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center gap-3'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Tìm theo ngày...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Thêm menu ngày
        </Button>
      </div>

      {/* Danh sách */}
      {sorted.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-muted-foreground'>
          <CalendarDays className='h-14 w-14 opacity-25' />
          <div className='text-center'>
            <p className='text-base font-medium'>Chưa có menu nào</p>
            <p className='text-sm'>Tạo menu đầu tiên để bắt đầu lên kế hoạch bữa ăn</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Tạo menu đầu tiên
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {sorted.map((menu) => (
            <DailyMenuCard key={menu.id} menu={menu} recipes={recipes} />
          ))}
        </div>
      )}

      {/* Dialog thêm menu mới (chỉ tạo DailyMenu + thêm 1 món đầu tiên) */}
      <AddMenuItemDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} recipes={recipes} />
    </div>
  )
}
