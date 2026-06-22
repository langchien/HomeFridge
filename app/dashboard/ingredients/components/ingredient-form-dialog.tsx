'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Apple, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ImageUpload } from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Category } from '@/generated/prisma/client'

import { createIngredientAction, updateIngredientAction } from '@/app/actions/ingredient'

// Danh mục ảnh mặc định dựa trên từ khóa tên danh mục
const DEFAULT_IMAGES_BY_CATEGORY: Record<string, string> = {
  rau: 'https://images.unsplash.com/photo-1566385101042-1a0104b7b927?w=500&auto=format&fit=crop&q=80',
  thịt: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80',
  'hải sản':
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
  cá: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
  nước: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
  'đồ uống':
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
  sữa: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
  trứng:
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80',
  quả: 'https://images.unsplash.com/photo-1610832958506-ee5633613df2?w=500&auto=format&fit=crop&q=80',
  'trái cây':
    'https://images.unsplash.com/photo-1610832958506-ee5633613df2?w=500&auto=format&fit=crop&q=80',
  bánh: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
  ngọt: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
  'gia vị':
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
  kem: 'https://images.unsplash.com/photo-1501443762811-7f1685449775?w=500&auto=format&fit=crop&q=80',
}

const SUGGESTED_UNITS = ['g', 'kg', 'ml', 'l', 'quả', 'hộp', 'gói', 'bó', 'con', 'cái', 'lon']

// Định nghĩa validation schema cho Ingredient
const ingredientSchema = z.object({
  name: z.string().min(2, { message: 'Tên nguyên liệu phải có ít nhất 2 ký tự.' }),
  image: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, { message: 'Vui lòng chọn danh mục.' }),
  unit: z.string().min(1, { message: 'Vui lòng nhập đơn vị đo lường.' }),
  storageInstructions: z.string().optional().or(z.literal('')),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

interface IngredientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null // Nguyên liệu cần chỉnh sửa, nếu null tức là Thêm mới
  categories: Category[]
  onSuccess: () => void // callback khi thêm/sửa thành công
}

export function IngredientFormDialog({
  open,
  onOpenChange,
  item,
  categories,
  onSuccess,
}: IngredientFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!item

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      image: '',
      categoryId: '',
      unit: 'g',
      storageInstructions: '',
    },
  })

  // Đổ dữ liệu cũ vào form khi chỉnh sửa
  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name || '',
          image: item.image || '',
          categoryId: item.categoryId || '',
          unit: item.unit || 'g',
          storageInstructions: item.storageInstructions || '',
        })
      } else {
        form.reset({
          name: '',
          image: '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          unit: 'g',
          storageInstructions: '',
        })
      }
    }
  }, [item, open, form, categories])

  // Submit form chính
  const onSubmit = async (values: IngredientFormValues) => {
    setLoading(true)
    try {
      let finalImage = values.image

      // Nếu không có ảnh tự tải lên, tự động tìm ảnh mặc định theo tên danh mục
      if (!finalImage) {
        const categoryName =
          categories.find((c) => c.id === values.categoryId)?.name?.toLowerCase() || ''
        const matchKey = Object.keys(DEFAULT_IMAGES_BY_CATEGORY).find((key) =>
          categoryName.includes(key),
        )
        if (matchKey) {
          finalImage = DEFAULT_IMAGES_BY_CATEGORY[matchKey]
        } else {
          finalImage =
            'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=500&auto=format&fit=crop&q=80'
        }
      }

      const submitValues = {
        ...values,
        image: finalImage,
      }

      let result
      if (isEdit && item) {
        result = await updateIngredientAction(item.id, submitValues)
      } else {
        result = await createIngredientAction(submitValues)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEdit
            ? `Cập nhật nguyên liệu "${values.name}" thành công!`
            : `Đã thêm nguyên liệu "${values.name}" thành công!`,
        )
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình lưu thông tin nguyên liệu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={'3xl'} className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold text-foreground'>
            <Apple className='size-5 text-emerald-600' />
            <span>{isEdit ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật lại thông tin nguyên liệu chuẩn trong hệ thống.'
              : 'Điền đầy đủ thông tin bên dưới để thêm nguyên liệu chuẩn mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            {/* Tên nguyên liệu */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Tên nguyên liệu *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: Thịt bò, Bắp cải, Sữa chua...'
                      {...field}
                      disabled={loading}
                      className='h-9'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Danh mục */}
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Danh mục *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Chọn danh mục' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className='mr-1.5'>{category.icon || '📦'}</span>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Đơn vị */}
            <FormField
              control={form.control}
              name='unit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Đơn vị đo lường mặc định *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: g, kg, ml, quả, bó...'
                      {...field}
                      disabled={loading}
                      className='h-9'
                    />
                  </FormControl>
                  <div className='flex flex-wrap gap-1.5 pt-1.5'>
                    {SUGGESTED_UNITS.map((u) => (
                      <button
                        key={u}
                        type='button'
                        onClick={() => form.setValue('unit', u)}
                        className='cursor-pointer rounded border border-muted bg-secondary/50 px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Cách bảo quản */}
            <FormField
              control={form.control}
              name='storageInstructions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Cách thức bảo quản</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='ví dụ: Bọc giấy báo cất ngăn mát tủ lạnh, Bảo quản đông lạnh ở nhiệt độ -18 độ C...'
                      {...field}
                      disabled={loading}
                      className='min-h-[80px] resize-none'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Ảnh nguyên liệu */}
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='font-semibold'>Hình ảnh nguyên liệu</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      folder='ingredients'
                    />
                  </FormControl>
                  <FormDescription className='text-xs text-muted-foreground'>
                    Nếu không tải ảnh lên, hệ thống sẽ tự động gán ảnh minh họa phù hợp từ Unsplash.
                  </FormDescription>
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
                className='h-9 bg-emerald-600 font-medium text-white hover:bg-emerald-700'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isEdit ? 'Lưu thay đổi' : 'Thêm nguyên liệu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
