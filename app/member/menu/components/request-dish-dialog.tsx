'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMenuRequestAction } from '@/app/actions/menu-request'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import type { MealTime } from '@/generated/prisma/client'

interface RequestDishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDishDialog({ open, onOpenChange }: RequestDishDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [dishName, setDishName] = useState('')
  const [note, setNote] = useState('')
  const [mealTime, setMealTime] = useState<MealTime | ''>('')
  const [date, setDate] = useState('')

  const handleSubmit = () => {
    if (!dishName.trim()) {
      toast.error('Vui lòng nhập tên món ăn!')
      return
    }

    startTransition(async () => {
      const result = await createMenuRequestAction({
        dishName: dishName.trim(),
        note: note.trim() || undefined,
        mealTime: (mealTime || undefined) as MealTime | undefined,
        date: date || undefined,
      })

      if (result.success) {
        toast.success('Đã gửi yêu cầu thành công!')
        onOpenChange(false)
        setDishName('')
        setNote('')
        setMealTime('')
        setDate('')
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Send className='h-5 w-5 text-primary' />
            Đề xuất món ăn
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dishName'>
              Tên món ăn <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='dishName'
              placeholder='Ví dụ: Phở bò, Cơm rang dưa bò...'
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <Label>Bữa mong muốn</Label>
              <Select value={mealTime} onValueChange={(v) => setMealTime(v as MealTime)}>
                <SelectTrigger>
                  <SelectValue placeholder='Tùy ý' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>Tùy ý</SelectItem>
                  <SelectItem value='LUNCH'>🌞 Bữa trưa</SelectItem>
                  <SelectItem value='DINNER'>🌙 Bữa tối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='date'>Ngày mong muốn</Label>
              <Input id='date' type='date' value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='note'>Ghi chú thêm</Label>
            <Textarea
              id='note'
              placeholder='Ví dụ: Ít cay, hoặc giải thích lý do muốn ăn...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Send className='mr-2 h-4 w-4' />
            )}
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
