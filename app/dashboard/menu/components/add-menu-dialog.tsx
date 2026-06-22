'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { addMenuPlanAction } from '@/app/actions/menu'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import type { MealTime } from '@/generated/prisma/client'
import type { Recipe } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'

// ─── Labels ───────────────────────────────────────────────────

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  BREAKFAST: '🌅 Bữa sáng',
  LUNCH: '☀️ Bữa trưa',
  DINNER: '🌙 Bữa tối',
}

export const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// ─── Schema ───────────────────────────────────────────────────

const formSchema = z.object({
  recipeId: z.string().min(1, 'Vui lòng chọn món ăn'),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Props ────────────────────────────────────────────────────

interface AddMenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ngày được chọn dưới dạng ISO string (chỉ phần ngày) */
  selectedDate: string | null
  selectedMealTime: MealTime | null
  recipes: Recipe[]
  onSuccess: () => void
}

// ─── Component ────────────────────────────────────────────────

export function AddMenuDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedMealTime,
  recipes,
  onSuccess,
}: AddMenuDialogProps) {
  const [loading, setLoading] = useState(false)
  const [recipePopoverOpen, setRecipePopoverOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { recipeId: '', note: '' },
  })

  // Reset form mỗi khi dialog mở
  useEffect(() => {
    if (open) form.reset({ recipeId: '', note: '' })
  }, [open, form])

  const onSubmit = async (values: FormValues) => {
    if (!selectedDate || !selectedMealTime) return
    setLoading(true)
    try {
      const result = await addMenuPlanAction({
        date: selectedDate,
        mealTime: selectedMealTime,
        recipeId: values.recipeId,
        note: values.note || undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        const recipeName = recipes.find((r) => r.id === values.recipeId)?.title || 'Món ăn'
        toast.success(`Đã thêm "${recipeName}" vào thực đơn!`)
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi thêm món ăn!')
    } finally {
      setLoading(false)
    }
  }

  // Định dạng ngày hiển thị
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : ''

  const mealLabel = selectedMealTime ? MEAL_TIME_LABELS[selectedMealTime] : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
            <UtensilsCrossed className='size-5 text-teal-600' />
            Thêm món vào thực đơn
          </DialogTitle>
          <DialogDescription>
            {formattedDate} — {mealLabel}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            {/* Chọn món ăn */}
            <FormField
              control={form.control}
              name='recipeId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Chọn món ăn *</FormLabel>
                  <Popover open={recipePopoverOpen} onOpenChange={setRecipePopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          disabled={loading}
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? recipes.find((r) => r.id === field.value)?.title || 'Chọn món...'
                            : 'Tìm và chọn công thức...'}
                          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[380px] p-0'>
                      <Command>
                        <CommandInput placeholder='Tìm công thức...' className='h-9' />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy công thức nào.</CommandEmpty>
                          <CommandGroup>
                            {recipes.map((recipe) => (
                              <CommandItem
                                key={recipe.id}
                                value={recipe.title}
                                onSelect={() => {
                                  field.onChange(recipe.id)
                                  setRecipePopoverOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4',
                                    field.value === recipe.id ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <div className='flex flex-col'>
                                  <span className='font-medium'>{recipe.title}</span>
                                  {(recipe.cookTime || recipe.prepTime) && (
                                    <span className='text-xs text-muted-foreground'>
                                      ⏱ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} phút
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ghi chú */}
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ví dụ: ít ớt, thêm rau...'
                      className='min-h-[60px] resize-none'
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='bg-teal-600 font-medium text-white hover:bg-teal-700'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                Thêm vào thực đơn
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
