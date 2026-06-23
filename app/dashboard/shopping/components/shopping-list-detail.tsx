'use client'

import {
  removeShoppingItemAction,
  toggleShoppingItemStatusAction,
  type ShoppingListWithItems,
  type ShoppingListItemWithRelations,
} from '@/app/actions/shopping'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { AddShoppingItemDialog } from './add-shopping-item-dialog'
import { StoreToFridgeDialog } from './store-to-fridge-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ShoppingListDetailProps {
  list: ShoppingListWithItems
  ingredients: any[]
  onDataChange: () => void
}

export function ShoppingListDetail({ list, ingredients, onDataChange }: ShoppingListDetailProps) {
  const [isPending, startTransition] = useTransition()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Group items by category
  const groupedItems = list.items.reduce(
    (acc, item) => {
      const categoryName = item.ingredient.category.name || 'Khác'
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(item)
      return acc
    },
    {} as Record<string, ShoppingListItemWithRelations[]>,
  )

  const handleToggle = (itemId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleShoppingItemStatusAction(itemId, !currentStatus)
      if (res.error) {
        toast.error(res.error)
      } else {
        onDataChange()
      }
    })
  }

  const handleRemoveClick = (itemId: string) => {
    setDeleteId(itemId)
  }

  const confirmRemove = () => {
    if (!deleteId) return
    startTransition(async () => {
      const res = await removeShoppingItemAction(deleteId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Đã xóa khỏi danh sách')
        onDataChange()
      }
      setDeleteId(null)
    })
  }

  if (list.items.length === 0) {
    return (
      <div className='flex flex-col items-center gap-4'>
        <div className='flex w-full flex-col items-center justify-center rounded-xl border border-dashed py-12 text-muted-foreground'>
          <p>Danh sách trống.</p>
          <p className='mt-1 text-sm'>Hãy thêm nguyên liệu cần mua vào danh sách này.</p>
          <Button variant='outline' className='mt-4' onClick={() => setAddDialogOpen(true)}>
            <Plus className='mr-2 size-4' /> Thêm món đồ cần mua
          </Button>
        </div>

        <AddShoppingItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          listId={list.id}
          ingredients={ingredients}
          onSuccess={onDataChange}
        />
      </div>
    )
  }

  const itemsToStore = list.items.filter((i) => i.isBought && !i.isStored)

  return (
    <div className='flex flex-col gap-6'>
      {itemsToStore.length > 0 && (
        <Button
          className='h-12 w-full animate-in bg-teal-600 text-base font-semibold shadow-md transition-all zoom-in-95 fade-in hover:bg-teal-700 hover:shadow-lg'
          onClick={() => setStoreDialogOpen(true)}
        >
          🧊 Cất {itemsToStore.length} món vào tủ lạnh
        </Button>
      )}

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {list.items.filter((i) => i.isBought).length} / {list.items.length} món đã nhặt
        </p>
        <Button onClick={() => setAddDialogOpen(true)} size='sm'>
          <Plus className='mr-2 size-4' /> Thêm món đồ
        </Button>
      </div>

      {Object.entries(groupedItems).map(([category, items]) => {
        const icon = items[0]?.ingredient.category.icon
        const categoryIcon = icon ? (
          icon.startsWith('http') ? (
            <img src={icon} alt={category} className='size-5 object-cover' />
          ) : (
            <span>{icon}</span>
          )
        ) : (
          <span>📦</span>
        )

        return (
          <div key={category} className='flex flex-col gap-3'>
            <div className='flex items-center gap-2 border-b pb-2'>
              {categoryIcon}
              <h4 className='font-semibold'>{category}</h4>
              <Badge variant='secondary' className='ml-2'>
                {items.length}
              </Badge>
            </div>

            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map((item) => {
                const isStored = item.isStored
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isStored
                        ? 'bg-muted/30 opacity-50 grayscale'
                        : item.isBought
                          ? 'border-teal-200 bg-teal-50/50'
                          : 'bg-card hover:border-teal-400 hover:shadow-sm'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Checkbox
                        checked={item.isBought}
                        onCheckedChange={() => handleToggle(item.id, item.isBought)}
                        disabled={isPending || isStored}
                        className='size-5'
                      />

                      {item.ingredient.image && (
                        <div className='relative size-10 overflow-hidden rounded-md border'>
                          <Image
                            src={item.ingredient.image}
                            alt={item.ingredient.name}
                            fill
                            className='object-cover'
                          />
                        </div>
                      )}

                      <div className='flex flex-col'>
                        <span
                          className={`font-medium ${item.isBought ? 'text-teal-700 dark:text-teal-400' : ''}`}
                        >
                          {item.ingredient.name}{' '}
                          {isStored && (
                            <Badge variant='secondary' className='ml-1 h-4 px-1 text-[10px]'>
                              Đã cất
                            </Badge>
                          )}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {item.quantity} {item.unit}
                          {item.note && ` • ${item.note}`}
                        </span>
                      </div>
                    </div>

                    {!isStored && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive'
                        onClick={() => handleRemoveClick(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <AddShoppingItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        listId={list.id}
        ingredients={ingredients}
        onSuccess={onDataChange}
      />

      <StoreToFridgeDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        items={itemsToStore}
        onSuccess={onDataChange}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Món đồ này sẽ bị xóa khỏi danh sách đi chợ. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmRemove()
              }}
              disabled={isPending}
              className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            >
              {isPending ? 'Đang xóa...' : 'Xóa món đồ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
