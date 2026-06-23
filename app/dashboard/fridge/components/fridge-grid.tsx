'use client'

import { FridgeItemWithIngredient, deleteFridgeItemAction } from '@/app/actions/fridge'
import { Button } from '@/components/ui/button'
import { Calendar, Edit2, MapPin, Package, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FridgeItemDialog } from './fridge-item-dialog'
import { StatusBadge } from './status-badge'

interface FridgeGridProps {
  items: FridgeItemWithIngredient[]
}

const LOCATION_LABELS: Record<string, string> = {
  FREEZER: 'Ngăn đông',
  CHILLER: 'Ngăn mát',
  FRIDGE_SHELF: 'Kệ tủ',
  VEGETABLE_DRAWER: 'Ngăn rau',
  DOOR_SHELF: 'Kệ cửa',
  PANTRY: 'Pantry',
}

// Màu nền card theo trạng thái
const STATUS_CARD_CLASS: Record<string, string> = {
  FRESH:
    'border-green-200/70 bg-green-50/50 hover:border-green-300 dark:border-green-800/50 dark:bg-green-950/30 dark:hover:border-green-700',
  EXPIRING_SOON:
    'border-amber-200/70 bg-amber-50/50 hover:border-amber-300 dark:border-amber-800/50 dark:bg-amber-950/30 dark:hover:border-amber-700',
  EXPIRED:
    'border-red-200/70 bg-red-50/50 hover:border-red-300 dark:border-red-800/50 dark:bg-red-950/30 dark:hover:border-red-700',
}

function getDaysRemaining(expiryDate: Date): { text: string; urgent: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { text: `Hết hạn ${Math.abs(diff)} ngày trước`, urgent: true }
  if (diff === 0) return { text: 'Hết hạn hôm nay', urgent: true }
  if (diff === 1) return { text: 'Còn 1 ngày', urgent: true }
  return { text: `Còn ${diff} ngày`, urgent: diff <= 3 }
}

export function FridgeGrid({ items }: FridgeGridProps) {
  const [itemToEdit, setItemToEdit] = useState<FridgeItemWithIngredient | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteFridgeItemAction(id)
    setDeletingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Đã xóa nguyên liệu khỏi tủ lạnh')
    }
  }

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
        <Package className='size-12 text-muted-foreground/40' />
        <p className='text-base font-medium text-muted-foreground'>Tủ lạnh đang trống</p>
        <p className='text-sm text-muted-foreground/70'>Hãy thêm nguyên liệu để bắt đầu.</p>
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {items.map((item) => {
          const { text: daysText, urgent } = getDaysRemaining(item.expiryDate)
          const cardClass = STATUS_CARD_CLASS[item.status] ?? STATUS_CARD_CLASS.FRESH
          const icon = item.ingredient.image ? null : '🧊'

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
            >
              {/* Icon / Image */}
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-background/70 text-2xl shadow-sm'>
                  {item.ingredient.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.ingredient.image}
                      alt={item.ingredient.name}
                      className='size-8 rounded object-cover'
                    />
                  ) : (
                    <span>{icon}</span>
                  )}
                </div>
                <StatusBadge status={item.status} />
              </div>

              {/* Tên nguyên liệu */}
              <h3 className='mb-1 line-clamp-1 text-sm font-bold text-foreground'>
                {item.ingredient.name}
              </h3>

              {/* Số lượng */}
              <p className='mb-3 text-lg font-semibold text-foreground'>
                {item.quantity}
                <span className='ml-0.5 text-sm font-normal text-muted-foreground'>
                  {item.unit}
                </span>
              </p>

              {/* Vị trí */}
              <div className='mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
                <MapPin className='size-3 shrink-0' />
                <span className='truncate'>
                  {LOCATION_LABELS[item.storageLocation] ?? item.storageLocation}
                </span>
              </div>

              {/* Ngày hết hạn */}
              <div
                className={`mb-4 flex items-center gap-1.5 text-xs ${urgent ? 'font-semibold text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
              >
                <Calendar className='size-3 shrink-0' />
                <span>{daysText}</span>
              </div>

              {/* Action buttons */}
              <div className='mt-auto flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 flex-1 border-border/60 text-xs font-medium hover:bg-background'
                  onClick={() => setItemToEdit(item)}
                >
                  <Edit2 className='mr-1 size-3' />
                  Sửa
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 border-border/60 px-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50'
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <FridgeItemDialog
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
        item={itemToEdit}
      />
    </>
  )
}
