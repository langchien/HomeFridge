'use client'

import { getIngredientsAction } from '@/app/actions/ingredient'
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipe'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Ingredient, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import { ChefHat, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[]
}

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: RecipeWithIngredients | null
}

interface FormValues {
  name: string
  description: string
  prepTime: string
  cookTime: string
  ingredients: { ingredientId: string; quantity: string; unit: string }[]
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const isEdit = !!recipe

  // Load danh sách nguyên liệu hệ thống
  useEffect(() => {
    async function loadIngredients() {
      try {
        const res = await getIngredientsAction()
        if (res.success && res.data) {
          setAllIngredients(res.data)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nguyên liệu:', err)
      }
    }
    if (open) {
      loadIngredients()
    }
  }, [open])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: recipe?.name ?? '',
      description: recipe?.description ?? '',
      prepTime: recipe?.prepTime?.toString() ?? '',
      cookTime: recipe?.cookTime?.toString() ?? '',
      ingredients: recipe?.ingredients?.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
      })) ?? [{ ingredientId: '', quantity: '1', unit: 'g' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  // Reset form khi recipe thay đổi
  useEffect(() => {
    if (open) {
      reset({
        name: recipe?.name ?? '',
        description: recipe?.description ?? '',
        prepTime: recipe?.prepTime?.toString() ?? '',
        cookTime: recipe?.cookTime?.toString() ?? '',
        ingredients: recipe?.ingredients?.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity.toString(),
          unit: ing.unit,
        })) ?? [{ ingredientId: '', quantity: '1', unit: 'g' }],
      })
    }
  }, [recipe, open, reset])

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        prepTime: values.prepTime ? parseInt(values.prepTime) : undefined,
        cookTime: values.cookTime ? parseInt(values.cookTime) : undefined,
        ingredients: values.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: parseFloat(ing.quantity) || 1,
          unit: ing.unit,
        })),
      }

      const result = isEdit
        ? await updateRecipeAction(recipe!.id, payload)
        : await createRecipeAction(payload)

      if (result.success) {
        toast.success(isEdit ? 'Đã cập nhật công thức!' : 'Đã tạo công thức mới!')
        onOpenChange(false)
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ChefHat className='h-5 w-5 text-primary' />
            {isEdit ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='flex min-h-0 flex-1 flex-col gap-4'>
          <div className='flex-1 overflow-y-auto pr-1'>
            <div className='flex flex-col gap-4 pb-2'>
              {/* Tên món */}
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='name'>
                  Tên món ăn <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  placeholder='Ví dụ: Canh chua cá hồi'
                  {...register('name', { required: 'Tên món không được để trống' })}
                />
                {errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
              </div>

              {/* Mô tả */}
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='description'>Mô tả</Label>
                <Textarea
                  id='description'
                  placeholder='Mô tả ngắn về món ăn...'
                  rows={2}
                  {...register('description')}
                />
              </div>

              {/* Thời gian */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='prepTime'>Thời gian chuẩn bị (phút)</Label>
                  <Input
                    id='prepTime'
                    type='number'
                    min='0'
                    placeholder='15'
                    {...register('prepTime')}
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <Label htmlFor='cookTime'>Thời gian nấu (phút)</Label>
                  <Input
                    id='cookTime'
                    type='number'
                    min='0'
                    placeholder='30'
                    {...register('cookTime')}
                  />
                </div>
              </div>

              <Separator />

              {/* Nguyên liệu */}
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <Label className='text-base font-semibold'>
                    Nguyên liệu <span className='text-destructive'>*</span>
                  </Label>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => append({ ingredientId: '', quantity: '1', unit: 'g' })}
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    Thêm nguyên liệu
                  </Button>
                </div>

                <div className='flex flex-col gap-2'>
                  {/* Header */}
                  <div className='grid grid-cols-[1fr_100px_90px_36px] gap-2 px-1'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Tên nguyên liệu
                    </span>
                    <span className='text-xs font-medium text-muted-foreground'>Số lượng</span>
                    <span className='text-xs font-medium text-muted-foreground'>Đơn vị</span>
                    <span />
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='grid grid-cols-[1fr_100px_90px_36px] items-center gap-2'
                    >
                      <select
                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                        {...register(`ingredients.${index}.ingredientId`, {
                          required: 'Không được để trống',
                        })}
                      >
                        <option value=''>Chọn nguyên liệu...</option>
                        {allIngredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        type='number'
                        min='0'
                        step='0.01'
                        placeholder='200'
                        {...register(`ingredients.${index}.quantity`, {
                          required: true,
                        })}
                      />
                      <Input
                        placeholder='g, kg, cái...'
                        {...register(`ingredients.${index}.unit`, {
                          required: true,
                        })}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className='h-9 w-9 text-destructive hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='border-t pt-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo công thức'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
