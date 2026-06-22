'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipe'
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
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import type { Ingredient } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import type { RecipeWithRelations } from './columns'

// ─── Validation schema ────────────────────────────────────────
const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'Vui lòng chọn nguyên liệu'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
})

const recipeSchema = z.object({
  title: z.string().min(2, 'Tên công thức phải có ít nhất 2 ký tự.'),
  thumbnail: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  prepTime: z.number().int().nonnegative().optional(),
  cookTime: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive().optional(),
  instructions: z.array(z.object({ value: z.string() })).min(1),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Vui lòng thêm ít nhất 1 nguyên liệu'),
})

// Khai báo type thủ công để tránh TypeScript inference issue với Zod transform
type RecipeFormValues = {
  title: string
  thumbnail?: string
  description?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  instructions: { value: string }[]
  ingredients: { ingredientId: string; quantity: number }[]
}

interface RecipeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe: RecipeWithRelations | null
  ingredients: Ingredient[]
  onSuccess: () => void
}

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  ingredients,
  onSuccess,
}: RecipeFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!recipe

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      thumbnail: '',
      description: '',
      prepTime: undefined,
      cookTime: undefined,
      servings: undefined,
      instructions: [{ value: '' }],
      ingredients: [{ ingredientId: '', quantity: 1 }],
    },
  })

  // Dynamic fields cho instructions và ingredients
  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control: form.control, name: 'instructions' })

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control: form.control, name: 'ingredients' })

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      if (recipe) {
        form.reset({
          title: recipe.title,
          thumbnail: recipe.thumbnail || '',
          description: recipe.description || '',
          prepTime: recipe.prepTime ?? undefined,
          cookTime: recipe.cookTime ?? undefined,
          servings: recipe.servings ?? undefined,
          instructions: recipe.instructions.map((v) => ({ value: v })),
          ingredients: recipe.ingredients.map((ri) => ({
            ingredientId: ri.ingredientId,
            quantity: ri.quantity,
          })),
        })
      } else {
        form.reset({
          title: '',
          thumbnail: '',
          description: '',
          prepTime: undefined,
          cookTime: undefined,
          servings: undefined,
          instructions: [{ value: '' }],
          ingredients: [{ ingredientId: '', quantity: 1 }],
        })
      }
    }
  }, [recipe, open, form])

  const onSubmit = async (values: RecipeFormValues) => {
    setLoading(true)
    try {
      const payload = {
        title: values.title,
        thumbnail: values.thumbnail || undefined,
        description: values.description || undefined,
        prepTime: values.prepTime,
        cookTime: values.cookTime,
        servings: values.servings,
        instructions: values.instructions.map((i) => i.value).filter(Boolean),
        ingredients: values.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        })),
      }

      const result =
        isEdit && recipe
          ? await updateRecipeAction(recipe.id, payload)
          : await createRecipeAction(payload)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEdit
            ? `Đã cập nhật công thức "${values.title}" thành công!`
            : `Đã thêm công thức "${values.title}" thành công!`,
        )
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình lưu công thức!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={'4xl'} className='max-h-[92vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
            <UtensilsCrossed className='size-5 text-amber-600' />
            {isEdit ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin công thức nấu ăn.'
              : 'Điền thông tin để thêm công thức nấu ăn mới vào thư viện.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 py-2'>
            {/* ── Tên công thức ─────────────────────────── */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Tên công thức *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: Phở bò tái chín, Canh chua cá lóc...'
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* ── Mô tả ──────────────────────────────────── */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả ngắn gọn về món ăn...'
                      {...field}
                      disabled={loading}
                      className='min-h-[70px] resize-none'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* ── Thời gian + Khẩu phần ─────────────────── */}
            <div className='grid grid-cols-3 gap-3'>
              <FormField
                control={form.control}
                name='prepTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Chuẩn bị (phút)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='15'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className='' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='cookTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Nấu (phút)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='30'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className='' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='servings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Khẩu phần</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='4'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className='' />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Nguyên liệu ────────────────────────────── */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold'>Nguyên liệu *</span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => appendIngredient({ ingredientId: '', quantity: 1 })}
                  disabled={loading}
                  className='h-7 gap-1'
                >
                  <Plus className='size-3' />
                  Thêm nguyên liệu
                </Button>
              </div>

              <div className='space-y-2 rounded-lg border p-3'>
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className='flex items-start gap-2'>
                    {/* Combobox chọn nguyên liệu */}
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.ingredientId`}
                      render={({ field: f }) => (
                        <FormItem className='flex-1'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant='outline'
                                  role='combobox'
                                  disabled={loading}
                                  className={cn(
                                    'h-8 w-full justify-between font-normal',
                                    !f.value && 'text-muted-foreground',
                                  )}
                                >
                                  {f.value
                                    ? ingredients.find((i) => i.id === f.value)?.name ||
                                      'Chọn nguyên liệu'
                                    : 'Chọn nguyên liệu...'}
                                  <ChevronsUpDown className='ml-2 size-3 shrink-0 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-[320px] p-0'>
                              <Command>
                                <CommandInput placeholder='Tìm nguyên liệu...' className='h-9' />
                                <CommandList>
                                  <CommandEmpty>Không tìm thấy nguyên liệu.</CommandEmpty>
                                  <CommandGroup>
                                    {ingredients.map((ing) => (
                                      <CommandItem
                                        key={ing.id}
                                        value={ing.name}
                                        onSelect={() => f.onChange(ing.id)}
                                        className=''
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 size-4',
                                            f.value === ing.id ? 'opacity-100' : 'opacity-0',
                                          )}
                                        />
                                        {ing.name}
                                        <span className='ml-auto text-muted-foreground'>
                                          {ing.unit}
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage className='' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field: f }) => (
                        <FormItem className='w-20'>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              placeholder='SL'
                              value={f.value ?? ''}
                              onChange={(e) =>
                                f.onChange(e.target.value ? Number(e.target.value) : 1)
                              }
                              disabled={loading}
                              className='h-8'
                            />
                          </FormControl>
                          <FormMessage className='' />
                        </FormItem>
                      )}
                    />

                    {/* Nút xóa */}
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={loading || ingredientFields.length <= 1}
                      onClick={() => removeIngredient(index)}
                      className='mt-0 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive'
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bước hướng dẫn ─────────────────────────── */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-semibold'>Hướng dẫn nấu *</span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => appendInstruction({ value: '' })}
                  disabled={loading}
                  className='h-7 gap-1'
                >
                  <Plus className='size-3' />
                  Thêm bước
                </Button>
              </div>

              <div className='space-y-2 rounded-lg border p-3'>
                {instructionFields.map((field, index) => (
                  <div key={field.id} className='flex items-center gap-2'>
                    {/* Số bước */}
                    <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'>
                      {index + 1}
                    </div>

                    <FormField
                      control={form.control}
                      name={`instructions.${index}.value`}
                      render={({ field: f }) => (
                        <FormItem className='flex-1'>
                          <FormControl>
                            <Input
                              placeholder={`Bước ${index + 1}: Mô tả bước nấu...`}
                              {...f}
                              disabled={loading}
                              className='h-8'
                            />
                          </FormControl>
                          <FormMessage className='' />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={loading || instructionFields.length <= 1}
                      onClick={() => removeInstruction(index)}
                      className='h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive'
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Thumbnail ──────────────────────────────── */}
            <FormField
              control={form.control}
              name='thumbnail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Ảnh thumbnail</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      folder='recipes'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 pt-4 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                disabled={loading}
                onClick={() => onOpenChange(false)}
                className='h-9 font-medium'
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='h-9 bg-amber-600 font-medium text-white hover:bg-amber-700'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isEdit ? 'Lưu thay đổi' : 'Thêm công thức'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
