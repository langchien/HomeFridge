'use client'

import {
  FridgeItemWithIngredient,
  addFridgeItemAction,
  getIngredientsAction,
  updateFridgeItemAction,
} from '@/app/actions/fridge'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit3, Loader2, Plus, RefrigeratorIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Ingredient = {
  id: string
  name: string
  unit: string
  image: string | null
  category: { name: string; icon: string | null }
}

const STORAGE_LOCATIONS = [
  { value: 'FREEZER', label: 'Ngăn đông (Freezer)' },
  { value: 'CHILLER', label: 'Ngăn mát (Chiller)' },
  { value: 'FRIDGE_SHELF', label: 'Kệ tủ lạnh' },
  { value: 'VEGETABLE_DRAWER', label: 'Ngăn rau' },
  { value: 'DOOR_SHELF', label: 'Kệ cửa tủ' },
  { value: 'PANTRY', label: 'Pantry' },
]

const UNITS = ['g', 'kg', 'ml', 'l', 'quả', 'bó', 'chai', 'hộp', 'con', 'gói', 'lon', 'cái']

// ─── Schema — một schema duy nhất, ingredientId required (validate runtime) ────

const formSchema = z.object({
  ingredientId: z.string().optional(),
  quantity: z
    .string()
    .min(1, { message: 'Vui lòng nhập số lượng.' })
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive({ message: 'Số lượng phải lớn hơn 0.' })),
  unit: z.string().min(1, { message: 'Vui lòng chọn đơn vị.' }),
  storageLocation: z.string().min(1, { message: 'Vui lòng chọn vị trí lưu trữ.' }),
  expiryDate: z.string().min(1, { message: 'Vui lòng chọn ngày hết hạn.' }),
})

type FormInput = {
  ingredientId?: string
  quantity: string
  unit: string
  storageLocation: string
  expiryDate: string
}

type FormOutput = z.output<typeof formSchema>

// ─── Props ─────────────────────────────────────────────────────────────────────

interface FridgeItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nếu có item → chế độ Edit; nếu null/undefined → chế độ Add */
  item?: FridgeItemWithIngredient | null
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function FridgeItemDialog({ open, onOpenChange, item }: FridgeItemDialogProps) {
  const isEdit = !!item
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ingredientId: '',
      quantity: '',
      unit: 'g',
      storageLocation: '',
      expiryDate: '',
    },
  })

  // Reset form + fetch ingredients khi dialog mở
  useEffect(() => {
    if (!open) return

    if (isEdit && item) {
      form.reset({
        ingredientId: item.ingredientId,
        quantity: item.quantity.toString(),
        unit: item.unit,
        storageLocation: item.storageLocation as string,
        expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
      })
    } else {
      form.reset({
        ingredientId: '',
        quantity: '',
        unit: 'g',
        storageLocation: '',
        expiryDate: '',
      })
      // eslint-disable-next-line react-hooks/immutability
      fetchIngredients()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit])

  async function fetchIngredients() {
    setLoadingIngredients(true)
    const result = await getIngredientsAction()
    if (result.data) {
      setIngredients(result.data)
    } else {
      toast.error('Không thể tải danh sách nguyên liệu.')
    }
    setLoadingIngredients(false)
  }

  // Khi chọn nguyên liệu → tự điền unit mặc định
  function handleIngredientChange(ingredientId: string, onChange: (v: string) => void) {
    onChange(ingredientId)
    const selected = ingredients.find((i) => i.id === ingredientId)
    if (selected?.unit) {
      form.setValue('unit', selected.unit)
    }
  }

  const onSubmit = async (values: FormOutput) => {
    // Validate ingredientId thủ công khi Add mode
    if (!isEdit && !values.ingredientId) {
      form.setError('ingredientId', { message: 'Vui lòng chọn nguyên liệu.' })
      return
    }

    setSubmitting(true)
    try {
      let result
      if (isEdit && item) {
        result = await updateFridgeItemAction(
          item.id,
          values.quantity,
          values.storageLocation,
          new Date(values.expiryDate),
        )
      } else {
        result = await addFridgeItemAction(
          values.ingredientId!,
          values.quantity,
          values.unit,
          values.storageLocation,
          new Date(values.expiryDate),
        )
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? 'Đã cập nhật nguyên liệu!' : 'Đã thêm vào tủ lạnh!')
        onOpenChange(false)
      }
    } catch {
      toast.error('Đã xảy ra lỗi, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  // Nhóm ingredients theo category
  const grouped = ingredients.reduce<Record<string, Ingredient[]>>((acc, ing) => {
    const cat = ing.category.name
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ing)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
            {isEdit ? (
              <>
                <Edit3 className='size-5 text-primary' />
                <span>Chỉnh sửa — {item?.ingredient.name}</span>
              </>
            ) : (
              <>
                <RefrigeratorIcon className='size-5 text-primary' />
                <span>Thêm nguyên liệu vào tủ lạnh</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật số lượng, vị trí hoặc ngày hết hạn.'
              : 'Chọn nguyên liệu và điền thông tin bên dưới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className='space-y-4 py-1'>
            {/* Chọn nguyên liệu — chỉ hiển thị khi thêm mới */}
            {!isEdit && (
              <FormField
                control={form.control}
                name='ingredientId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Nguyên liệu *</FormLabel>
                    <Select
                      onValueChange={(v) => handleIngredientChange(v, field.onChange)}
                      value={field.value ?? ''}
                      disabled={loadingIngredients || submitting}
                    >
                      <FormControl>
                        <SelectTrigger className='h-9'>
                          {loadingIngredients ? (
                            <span className='text-muted-foreground'>Đang tải...</span>
                          ) : (
                            <SelectValue placeholder='Chọn nguyên liệu' />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-64'>
                        {loadingIngredients ? (
                          <div className='space-y-1 p-2'>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className='h-7 w-full' />
                            ))}
                          </div>
                        ) : Object.keys(grouped).length === 0 ? (
                          <div className='p-4 text-center text-sm text-muted-foreground'>
                            Không có nguyên liệu nào trong hệ thống.
                          </div>
                        ) : (
                          Object.entries(grouped).map(([category, items]) => (
                            <SelectGroup key={category}>
                              <SelectLabel className='text-xs font-semibold text-muted-foreground'>
                                {category}
                              </SelectLabel>
                              {items.map((ing) => (
                                <SelectItem key={ing.id} value={ing.id}>
                                  <span className='flex items-center gap-2'>
                                    {ing.category.icon && (
                                      <span className='text-base'>{ing.category.icon}</span>
                                    )}
                                    {ing.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Số lượng + Đơn vị */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Số lượng *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        placeholder='100'
                        className='h-9'
                        disabled={submitting}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Đơn vị *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger className='h-9'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vị trí lưu trữ */}
            <FormField
              control={form.control}
              name='storageLocation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Vị trí lưu trữ *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={submitting}>
                    <FormControl>
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Chọn vị trí' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STORAGE_LOCATIONS.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ngày hết hạn */}
            <FormField
              control={form.control}
              name='expiryDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Ngày hết hạn *</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      className='h-9'
                      disabled={submitting}
                      {...field}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 pt-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                disabled={submitting}
                onClick={() => onOpenChange(false)}
                className='h-9 font-medium'
              >
                Hủy bỏ
              </Button>
              <Button type='submit' disabled={submitting} className='h-9 font-medium'>
                {submitting && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isEdit ? (
                  'Lưu thay đổi'
                ) : (
                  <>
                    <Plus className='mr-1.5 size-4' />
                    Thêm vào tủ lạnh
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
