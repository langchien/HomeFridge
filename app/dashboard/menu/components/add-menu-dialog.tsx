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
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  mealTime: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
  recipeId: z.string().min(1, 'Vui lòng chọn món ăn'),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ─── Props ────────────────────────────────────────────────────

interface AddMenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ngày được chọn dưới dạng ISO string (chỉ phần ngày) */
  selectedDate?: string | null
  selectedMealTime?: MealTime | null
  recipes: Recipe[]
  defaultRecipeId?: string
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────

export function AddMenuDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedMealTime,
  recipes,
  defaultRecipeId,
  onSuccess,
}: AddMenuDialogProps) {
  const [loading, setLoading] = useState(false)
  const [recipePopoverOpen, setRecipePopoverOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      date: selectedDate ? selectedDate.split('T')[0] : '', // format YYYY-MM-DD
      mealTime: selectedMealTime || undefined,
      recipeId: defaultRecipeId || '', 
      note: '' 
    },
  })

  // Reset form mỗi khi dialog mở
  useEffect(() => {
    if (open) form.reset({ 
      date: selectedDate ? selectedDate.split('T')[0] : '',
      mealTime: selectedMealTime || undefined,
      recipeId: defaultRecipeId || '', 
      note: '' 
    })
  }, [open, form, defaultRecipeId, selectedDate, selectedMealTime])

  const onSubmit = async (values: FormValues) => {
    // TODO: Tương lai - Tích hợp "Kế hoạch đi chợ"
    // 1. Dùng API kiểm tra số lượng nguyên liệu trong tủ lạnh trước khi addMenuPlanAction.
    // 2. Nếu không đủ nguyên liệu (kể cả thiếu 1 phần), mở một Dialog Alert.
    // 3. Dialog Alert thông báo món này đang thiếu nguyên liệu X, Y.
    //    - Kèm theo một nút/gợi ý "Thêm các nguyên liệu còn thiếu vào Kế hoạch đi chợ".
    // 4. Cho phép người dùng quyết định vẫn lên thực đơn hay hủy bỏ.
    setLoading(true)
    try {
      const result = await addMenuPlanAction({
        date: new Date(values.date).toISOString(),
        mealTime: values.mealTime,
        recipeId: values.recipeId,
        note: values.note || undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        const recipeName = recipes.find((r) => r.id === values.recipeId)?.title || 'Món ăn'
        if (defaultRecipeId) {
          toast.success(`✨ Đã thêm "${recipeName}" từ gợi ý thông minh!`)
        } else {
          toast.success(`Đã thêm "${recipeName}" vào thực đơn!`)
        }
        onSuccess?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi thêm món ăn!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
            <UtensilsCrossed className='size-5 text-teal-600' />
            Thêm món vào thực đơn
          </DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm món ăn vào thực đơn hàng tuần của bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Ngày */}
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Ngày *</FormLabel>
                    <FormControl>
                      <input 
                        type="date" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bữa ăn */}
              <FormField
                control={form.control}
                name='mealTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Bữa ăn *</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={loading}
                        {...field}
                      >
                        <option value="" disabled>Chọn bữa ăn...</option>
                        <option value="BREAKFAST">{MEAL_TIME_LABELS['BREAKFAST']}</option>
                        <option value="LUNCH">{MEAL_TIME_LABELS['LUNCH']}</option>
                        <option value="DINNER">{MEAL_TIME_LABELS['DINNER']}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
