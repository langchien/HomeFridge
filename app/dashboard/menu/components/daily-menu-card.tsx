'use client'

import { deleteDailyMenuAction, removeMenuItemAction } from '@/app/actions/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import type { DailyMenu, DailyMenuItem, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import { Moon, MoreHorizontal, Plus, Sun, Trash2, UtensilsCrossed, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { AddMenuItemDialog } from './add-menu-item-dialog'
import { MenuStatusBadge } from './menu-status-badge'
import type { RecipeWithIngredients } from './recipe-form-dialog'

type MenuItemWithRecipe = DailyMenuItem & {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}

type DailyMenuWithItems = DailyMenu & { items: MenuItemWithRecipe[] }

interface DailyMenuCardProps {
  menu: DailyMenuWithItems
  recipes: RecipeWithIngredients[]
}

function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateShort(date: Date | string) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function DailyMenuCard({ menu, recipes }: DailyMenuCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [defaultMealTime, setDefaultMealTime] = useState<'LUNCH' | 'DINNER'>('LUNCH')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deletingMenu, setDeletingMenu] = useState(false)
  const [isPending, startTransition] = useTransition()

  const lunchItems = menu.items.filter((i) => i.mealTime === 'LUNCH')
  const dinnerItems = menu.items.filter((i) => i.mealTime === 'DINNER')

  const handleAddMeal = (mealTime: 'LUNCH' | 'DINNER') => {
    setDefaultMealTime(mealTime)
    setAddDialogOpen(true)
  }

  const handleRemoveItem = (itemId: string) => {
    setRemovingId(itemId)
    startTransition(async () => {
      const result = await removeMenuItemAction(itemId)
      setRemovingId(null)
      if (result.success) {
        toast.success('Đã xóa món khỏi menu!')
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  const handleDeleteMenu = () => {
    setDeletingMenu(true)
    startTransition(async () => {
      const result = await deleteDailyMenuAction(menu.id)
      setDeletingMenu(false)
      if (result.success) {
        toast.success('Đã xóa menu ngày!')
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  return (
    <>
      <Card className='overflow-hidden transition-shadow hover:shadow-md'>
        {/* Card Header */}
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-base font-semibold capitalize'>{formatDate(menu.date)}</h3>
              <div className='flex items-center gap-2'>
                <MenuStatusBadge menuId={menu.id} status={menu.status} />
                <span className='text-xs text-muted-foreground'>{menu.items.length} món</span>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={handleDeleteMenu}
                    className='text-destructive focus:text-destructive'
                    disabled={deletingMenu || isPending}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Xóa menu ngày này
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className='flex flex-col gap-4 pt-0'>
          {/* Bữa trưa */}
          <MealSection
            icon={<Sun className='h-4 w-4 text-amber-500' />}
            label='Bữa trưa'
            items={lunchItems}
            onAddMeal={() => handleAddMeal('LUNCH')}
            onRemoveItem={handleRemoveItem}
            removingId={removingId}
          />

          <Separator />

          {/* Bữa tối */}
          <MealSection
            icon={<Moon className='h-4 w-4 text-indigo-500' />}
            label='Bữa tối'
            items={dinnerItems}
            onAddMeal={() => handleAddMeal('DINNER')}
            onRemoveItem={handleRemoveItem}
            removingId={removingId}
          />
        </CardContent>
      </Card>

      <AddMenuItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        dailyMenuId={menu.id}
        recipes={recipes}
        defaultMealTime={defaultMealTime}
      />
    </>
  )
}

interface MealSectionProps {
  icon: React.ReactNode
  label: string
  items: MenuItemWithRecipe[]
  onAddMeal: () => void
  onRemoveItem: (id: string) => void
  removingId: string | null
}

function MealSection({
  icon,
  label,
  items,
  onAddMeal,
  onRemoveItem,
  removingId,
}: MealSectionProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5 font-medium'>
          {icon}
          {label}
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 gap-1 text-muted-foreground hover:text-foreground'
          onClick={onAddMeal}
        >
          <Plus className='h-3.5 w-3.5' />
          Thêm món
        </Button>
      </div>

      {items.length === 0 ? (
        <div className='flex items-center gap-2 rounded-md border border-dashed px-2 py-2 text-muted-foreground'>
          <UtensilsCrossed className='h-3.5 w-3.5' />
          Chưa có món cho bữa này
        </div>
      ) : (
        <div className='flex flex-col gap-1.5'>
          {items.map((item) => (
            <div
              key={item.id}
              className='group flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <span className='truncate font-medium'>{item.recipe.name}</span>
                {item.servings > 1 && (
                  <Badge variant='secondary' className='shrink-0'>
                    x{item.servings}
                  </Badge>
                )}
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive'
                onClick={() => onRemoveItem(item.id)}
                disabled={removingId === item.id}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
