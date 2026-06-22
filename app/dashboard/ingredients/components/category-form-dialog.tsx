'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { createCategoryAction } from '@/app/actions/ingredient'
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
import type { Category } from '@/generated/prisma/client'

const categorySchema = z.object({
  name: z.string().min(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự.' }),
  icon: z
    .string()
    .max(4, { message: 'Icon chỉ nên chứa 1 biểu tượng cảm xúc.' })
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newCategory: Category) => void
}

export function CategoryFormDialog({ open, onOpenChange, onSuccess }: CategoryFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '🍎',
      description: '',
    },
  })

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true)
    try {
      const result = await createCategoryAction({
        name: values.name,
        icon: values.icon || '🍎',
        description: values.description || '',
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        toast.success(`Đã thêm danh mục mới "${result.data.name}" thành công!`)
        onSuccess(result.data as Category)
        onOpenChange(false)
        form.reset()
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình tạo danh mục mới!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold text-foreground'>
            <FolderPlus className='size-5 text-blue-600' />
            <span>Thêm danh mục mới</span>
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Thêm một danh mục thực phẩm mới để dễ dàng phân loại nguyên liệu.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            {/* Tên danh mục */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Tên danh mục *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: Thảo mộc, Đồ đóng hộp, Bánh ngọt...'
                      {...field}
                      disabled={loading}
                      className='h-9'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Icon */}
            <FormField
              control={form.control}
              name='icon'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Biểu tượng (Emoji) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: 🌿, 🥫, 🧁...'
                      {...field}
                      disabled={loading}
                      className='h-9'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Mô tả danh mục</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: Các loại thảo mộc khô và tươi dùng nêm nếm...'
                      {...field}
                      disabled={loading}
                      className='h-9'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 pt-2 sm:gap-0'>
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
                className='h-9 bg-blue-600 font-medium text-white hover:bg-blue-700'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                Tạo danh mục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
