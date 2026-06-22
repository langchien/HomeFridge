'use client'

import { useState, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipe'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, ChefHat } from 'lucide-react'
import type { Recipe, RecipeIngredient } from '@/generated/prisma/client'

export type RecipeWithIngredients = Recipe & { ingredients: RecipeIngredient[] }

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
  ingredients: { name: string; quantity: string; unit: string }[]
}

export function RecipeFormDialog({ open, onOpenChange, recipe }: RecipeFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!recipe

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
        name: ing.name,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
      })) ?? [{ name: '', quantity: '1', unit: 'g' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  // Reset form khi recipe thay đổi
  useState(() => {
    if (open) {
      reset({
        name: recipe?.name ?? '',
        description: recipe?.description ?? '',
        prepTime: recipe?.prepTime?.toString() ?? '',
        cookTime: recipe?.cookTime?.toString() ?? '',
        ingredients: recipe?.ingredients?.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity.toString(),
          unit: ing.unit,
        })) ?? [{ name: '', quantity: '1', unit: 'g' }],
      })
    }
  })

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        prepTime: values.prepTime ? parseInt(values.prepTime) : undefined,
        cookTime: values.cookTime ? parseInt(values.cookTime) : undefined,
        ingredients: values.ingredients.map((ing) => ({
          name: ing.name,
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
                  placeholder='Ví dụ: Canh chua cá lóc'
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
                    onClick={() => append({ name: '', quantity: '1', unit: 'g' })}
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
                      <Input
                        placeholder='Ví dụ: Cá lóc'
                        {...register(`ingredients.${index}.name`, {
                          required: 'Không được để trống',
                        })}
                      />
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
