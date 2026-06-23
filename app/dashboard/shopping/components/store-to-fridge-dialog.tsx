'use client'

import {
  storeItemsToFridgeAction,
  type ShoppingListItemWithRelations,
} from '@/app/actions/shopping'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StorageLocation } from '@/generated/prisma/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const STORAGE_LOCATIONS: { value: StorageLocation; label: string }[] = [
  { value: 'FRIDGE_SHELF', label: 'Ngăn mát' },
  { value: 'FREEZER', label: 'Ngăn đông' },
  { value: 'CHILLER', label: 'Ngăn đông mềm' },
  { value: 'VEGETABLE_DRAWER', label: 'Ngăn rau củ' },
  { value: 'DOOR_SHELF', label: 'Cánh tủ' },
  { value: 'PANTRY', label: 'Tủ khô (Bên ngoài)' },
]

interface StoreToFridgeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ShoppingListItemWithRelations[]
  onSuccess: () => void
}

export function StoreToFridgeDialog({
  open,
  onOpenChange,
  items,
  onSuccess,
}: StoreToFridgeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<
    Record<string, { storageLocation: string; expiryDate: string }>
  >({})

  const [bulkDays, setBulkDays] = useState<number>(7)
  const [bulkLocation, setBulkLocation] = useState<string>('FRIDGE_SHELF')

  // Khởi tạo form khi mở dialog
  useEffect(() => {
    if (open) {
      const initialData: Record<string, { storageLocation: string; expiryDate: string }> = {}

      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7)
      const defaultDateStr = defaultDate.toISOString().split('T')[0]

      items.forEach((item) => {
        initialData[item.id] = {
          storageLocation: 'FRIDGE_SHELF',
          expiryDate: defaultDateStr,
        }
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialData)
    }
  }, [open, items])

  const handleBulkApply = () => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + bulkDays)
    const defaultDateStr = defaultDate.toISOString().split('T')[0]

    const newData = { ...formData }
    items.forEach((item) => {
      newData[item.id] = {
        storageLocation: bulkLocation,
        expiryDate: defaultDateStr,
      }
    })
    setFormData(newData)
    toast.success('Đã áp dụng hàng loạt!')
  }

  const handleItemChange = (id: string, field: 'storageLocation' | 'expiryDate', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = items.map((item) => ({
        id: item.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        storageLocation: formData[item.id]?.storageLocation || 'FRIDGE_SHELF',
        expiryDate: new Date(formData[item.id]?.expiryDate || new Date()),
      }))

      const res = await storeItemsToFridgeAction(payload)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Đã cất ${payload.length} món vào tủ lạnh!`)
        onSuccess()
        onOpenChange(false)
      }
    } catch (err) {
      toast.error('Lỗi khi cất tủ lạnh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='3xl' className='flex max-h-[90vh] flex-col'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Duyệt & Cất tủ lạnh</DialogTitle>
          <DialogDescription className='text-base'>
            Hãy kiểm tra và phân loại vị trí, hạn sử dụng cho {items.length} món đồ trước khi đưa
            vào tủ lạnh.
          </DialogDescription>
        </DialogHeader>

        {/* Cấu hình hàng loạt */}
        <div className='flex items-end gap-4 rounded-xl border bg-muted/50 p-4'>
          <div className='grid flex-1 gap-1'>
            <Label className='text-xs text-muted-foreground'>Vị trí mặc định</Label>
            <Select value={bulkLocation} onValueChange={setBulkLocation}>
              <SelectTrigger className='h-9 bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid flex-1 gap-1'>
            <Label className='text-xs text-muted-foreground'>Số ngày sử dụng mặc định</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                min={1}
                className='h-9 bg-background'
                value={bulkDays}
                onChange={(e) => setBulkDays(Number(e.target.value))}
              />
              <span className='text-sm font-medium'>Ngày</span>
            </div>
          </div>
          <Button type='button' variant='secondary' className='h-9' onClick={handleBulkApply}>
            Áp dụng tất cả
          </Button>
        </div>

        {/* Danh sách items */}
        <form
          id='store-form'
          onSubmit={handleSubmit}
          className='flex flex-1 flex-col gap-3 overflow-y-auto py-4 pr-2'
        >
          {items.map((item) => (
            <div key={item.id} className='flex items-center gap-4 rounded-lg border bg-card p-3'>
              <div className='relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted'>
                {item.ingredient.image ? (
                  <Image
                    src={item.ingredient.image}
                    alt={item.ingredient.name}
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-xl'>🍱</div>
                )}
              </div>
              <div className='flex min-w-[150px] flex-1 flex-col'>
                <span className='line-clamp-1 font-bold'>{item.ingredient.name}</span>
                <span className='text-sm text-muted-foreground'>
                  {item.quantity} {item.unit}
                </span>
              </div>

              <div className='flex shrink-0 items-center gap-3'>
                <Select
                  value={formData[item.id]?.storageLocation || 'FRIDGE_SHELF'}
                  onValueChange={(val) => handleItemChange(item.id, 'storageLocation', val)}
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type='date'
                  className='w-[160px]'
                  value={formData[item.id]?.expiryDate || ''}
                  onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </form>

        <DialogFooter className='shrink-0 border-t pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type='submit' form='store-form' disabled={loading} className='min-w-[120px]'>
            {loading ? 'Đang xử lý...' : `Cất ${items.length} món vào tủ`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
