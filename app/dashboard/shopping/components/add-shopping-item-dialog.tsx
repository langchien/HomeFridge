'use client'

import { addShoppingItemAction } from '@/app/actions/shopping'
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
import { useState } from 'react'
import { toast } from 'sonner'

interface AddShoppingItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  ingredients: any[]
  onSuccess: () => void
}

export function AddShoppingItemDialog({
  open,
  onOpenChange,
  listId,
  ingredients,
  onSuccess,
}: AddShoppingItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [note, setNote] = useState('')

  const selectedIngredient = ingredients.find((i) => i.id === selectedIngredientId)
  const unit = selectedIngredient?.unit || 'g'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIngredientId) {
      toast.error('Vui lòng chọn nguyên liệu cần mua')
      return
    }

    setLoading(true)
    try {
      const res = await addShoppingItemAction({
        shoppingListId: listId,
        ingredientId: selectedIngredientId,
        quantity,
        unit,
        note,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Đã thêm vào danh sách đi chợ')
        onSuccess()
        onOpenChange(false)

        // Reset form
        setSelectedIngredientId('')
        setQuantity(1)
        setNote('')
      }
    } catch (err) {
      toast.error('Lỗi khi thêm nguyên liệu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-6 sm:max-w-2xl sm:p-8'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <DialogHeader className='gap-1'>
            <DialogTitle className='text-2xl'>Thêm món cần mua</DialogTitle>
            <DialogDescription className='text-base'>
              Chọn nguyên liệu và số lượng để thêm vào danh sách đi chợ.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 py-2'>
            {/* Nguyên liệu và Số lượng cùng hàng */}
            <div className='grid grid-cols-[2fr_1fr] gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='ingredient'>Nguyên liệu</Label>
                <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn nguyên liệu...' />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='quantity'>Số lượng</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='quantity'
                    type='number'
                    min={0.1}
                    step={0.1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                  <span className='min-w-8 text-sm text-muted-foreground'>{unit}</span>
                </div>
              </div>
            </div>

            {/* Ghi chú hàng dưới */}
            <div className='grid gap-2'>
              <Label htmlFor='note'>Ghi chú (Tùy chọn)</Label>
              <Input
                id='note'
                placeholder='Ví dụ: Mua loại tươi...'
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className='px-6'
            >
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='px-6'>
              {loading ? 'Đang thêm...' : 'Thêm vào danh sách'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
