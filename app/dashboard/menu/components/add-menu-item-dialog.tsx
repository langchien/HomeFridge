'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addMenuItemAction, createDailyMenuAction } from '@/app/actions/menu'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import type { MealTime } from '@/generated/prisma/client'
import type { RecipeWithIngredients } from './recipe-form-dialog'

interface AddMenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dailyMenuId?: string // Nếu có = thêm món vào menu đã tồn tại; nếu không = tạo menu mới
  recipes: RecipeWithIngredients[]
  defaultDate?: string // YYYY-MM-DD
  defaultMealTime?: MealTime
}

export function AddMenuItemDialog({
  open,
  onOpenChange,
  dailyMenuId,
  recipes,
  defaultDate,
  defaultMealTime = 'LUNCH',
}: AddMenuItemDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? '')
  const [mealTime, setMealTime] = useState<MealTime>(defaultMealTime)
  const [recipeId, setRecipeId] = useState('')
  const [servings, setServings] = useState('1')

  const handleSubmit = () => {
    if (!recipeId) {
      toast.error('Vui lòng chọn món ăn!')
      return
    }

    startTransition(async () => {
      let menuId = dailyMenuId

      // Nếu chưa có menu cho ngày này, tạo mới trước
      if (!menuId) {
        if (!selectedDate) {
          toast.error('Vui lòng chọn ngày!')
          return
        }
        const createResult = await createDailyMenuAction({ date: selectedDate })
        if (!createResult.success) {
          toast.error(createResult.error ?? 'Không thể tạo menu ngày!')
          return
        }
        menuId = createResult.data.id
      }

      const result = await addMenuItemAction({
        dailyMenuId: menuId!,
        recipeId,
        mealTime,
        servings: parseInt(servings) || 1,
      })

      if (result.success) {
        toast.success('Đã thêm món vào menu!')
        onOpenChange(false)
        // Reset
        setRecipeId('')
        setServings('1')
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
            <Plus className='h-5 w-5 text-primary' />
            Thêm món vào menu
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-2'>
          {/* Chọn ngày (chỉ hiện nếu chưa có dailyMenuId) */}
          {!dailyMenuId && (
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='date'>
                Ngày <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='date'
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {/* Chọn bữa */}
          <div className='flex flex-col gap-1.5'>
            <Label>Bữa ăn</Label>
            <Select value={mealTime} onValueChange={(v) => setMealTime(v as MealTime)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='LUNCH'>🌞 Bữa trưa</SelectItem>
                <SelectItem value='DINNER'>🌙 Bữa tối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chọn công thức */}
          <div className='flex flex-col gap-1.5'>
            <Label>
              Món ăn <span className='text-destructive'>*</span>
            </Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn món ăn...' />
              </SelectTrigger>
              <SelectContent>
                {recipes.length === 0 ? (
                  <SelectItem value='' disabled>
                    Chưa có công thức nào
                  </SelectItem>
                ) : (
                  recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Số phần ăn */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='servings'>Số phần ăn</Label>
            <Input
              id='servings'
              type='number'
              min='1'
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              Nguyên liệu sẽ được nhân theo số phần ăn khi tính toán
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Thêm món
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
