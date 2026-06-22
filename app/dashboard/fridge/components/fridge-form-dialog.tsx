'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, CalendarIcon, Apple } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import type { Category, User } from '@/generated/prisma/client'

// Định nghĩa Enum StorageLocation thủ công ở phía client để tránh bundle Prisma client vào client-side gây lỗi compile Turbopack
export enum StorageLocation {
  FREEZER = 'FREEZER',
  CHILLER = 'CHILLER',
  FRIDGE_SHELF = 'FRIDGE_SHELF',
  VEGETABLE_DRAWER = 'VEGETABLE_DRAWER',
  DOOR_SHELF = 'DOOR_SHELF',
  PANTRY = 'PANTRY',
}

import {
  createFridgeItemAction,
  updateFridgeItemAction,
  createCategoryAction,
} from '@/app/actions/fridge'

// Hàm format ngày thành yyyy-MM-dd bằng JS thuần để tránh dùng thư viện date-fns bên ngoài
const formatDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Bản đồ dịch sang tiếng Việt của StorageLocation
const LOCATION_MAP: Record<StorageLocation, string> = {
  FREEZER: 'Tủ đông',
  CHILLER: 'Ngăn mát (Chiller)',
  FRIDGE_SHELF: 'Ngăn kệ',
  VEGETABLE_DRAWER: 'Ngăn rau củ',
  DOOR_SHELF: 'Ngăn cửa',
  PANTRY: 'Tủ bếp',
}

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

const SUGGESTED_UNITS = ['cái', 'kg', 'g', 'lít', 'ml', 'hộp', 'chai', 'túi', 'bó', 'quả']

// Định nghĩa validation schema
const fridgeItemSchema = z.object({
  name: z.string().min(2, { message: 'Tên thực phẩm phải có ít nhất 2 ký tự.' }),
  image: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, { message: 'Vui lòng chọn danh mục.' }),
  location: z.nativeEnum(StorageLocation),
  quantity: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Số lượng phải là số thực lớn hơn 0.',
  }),
  unit: z.string().min(1, { message: 'Đơn vị không được để trống.' }),
  expiryDate: z.string().min(1, { message: 'Hạn sử dụng là bắt buộc.' }),
  storageInstructions: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  userId: z.string().min(1, { message: 'Vui lòng chọn người thêm thực phẩm.' }),
})

type FridgeFormValues = z.infer<typeof fridgeItemSchema>

// Zod Schema cho Dialog Tạo nhanh Danh mục
const quickCategorySchema = z.object({
  name: z.string().min(2, { message: 'Tên danh mục ít nhất 2 ký tự.' }),
  icon: z
    .string()
    .max(4, { message: 'Icon chỉ nên chứa 1 biểu tượng cảm xúc.' })
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

type QuickCategoryValues = z.infer<typeof quickCategorySchema>

interface FridgeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null // Thực phẩm cần chỉnh sửa, nếu null tức là Thêm mới
  categories: Category[]
  users: User[]
  onSuccess: (updatedCategories?: Category[]) => void // callback khi thêm/sửa thành công
}

export function FridgeFormDialog({
  open,
  onOpenChange,
  item,
  categories: initialCategories,
  users,
  onSuccess,
}: FridgeFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [prevInitialCategories, setPrevInitialCategories] = useState<Category[]>(initialCategories)

  const isEdit = !!item

  if (initialCategories !== prevInitialCategories) {
    setPrevInitialCategories(initialCategories)
    setCategories(initialCategories)
  }

  const form = useForm<FridgeFormValues>({
    resolver: zodResolver(fridgeItemSchema),
    defaultValues: {
      name: '',
      image: '',
      categoryId: '',
      location: StorageLocation.FRIDGE_SHELF,
      quantity: '1',
      unit: 'cái',
      expiryDate: '',
      storageInstructions: '',
      notes: '',
      userId: '',
    },
  })

  const categoryForm = useForm<QuickCategoryValues>({
    resolver: zodResolver(quickCategorySchema),
    defaultValues: {
      name: '',
      icon: '🍎',
      description: '',
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
          location: item.location || StorageLocation.FRIDGE_SHELF,
          quantity: item.quantity?.toString() || '1',
          unit: item.unit || 'cái',
          expiryDate: item.expiryDate ? formatDateString(new Date(item.expiryDate)) : '',
          storageInstructions: item.storageInstructions || '',
          notes: item.notes || '',
          userId: item.userId || '',
        })
      } else {
        // Mode thêm mới, tự động chọn User đầu tiên hoặc user đã đăng nhập nếu có
        const defaultUser = users.length > 0 ? users[0].id : ''
        form.reset({
          name: '',
          image: '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          location: StorageLocation.FRIDGE_SHELF,
          quantity: '1',
          unit: 'cái',
          expiryDate: formatDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Mặc định hạn sử dụng là 7 ngày tới
          storageInstructions: '',
          notes: '',
          userId: defaultUser,
        })
      }
    }
  }, [item, open, form, categories, users])

  // Submit form chính
  const onSubmit = async (values: FridgeFormValues) => {
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
        result = await updateFridgeItemAction(item.id, submitValues)
      } else {
        result = await createFridgeItemAction(submitValues)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEdit
            ? `Cập nhật "${values.name}" thành công!`
            : `Đã thêm "${values.name}" vào tủ lạnh!`,
        )
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình lưu thông tin thực phẩm!')
    } finally {
      setLoading(false)
    }
  }

  // Tạo nhanh danh mục mới
  const onQuickCategorySubmit = async (values: QuickCategoryValues) => {
    setCategoryLoading(true)
    try {
      const result = await createCategoryAction({
        name: values.name,
        icon: values.icon || '🍎',
        description: values.description || '',
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        const newCategory = result.data as Category
        toast.success(`Đã thêm danh mục mới "${newCategory.name}"!`)

        // Thêm danh mục mới vào state cục bộ để hiển thị ngay trong dropdown
        const updatedList = [...categories, newCategory]
        setCategories(updatedList)

        // Tự chọn danh mục vừa tạo trong form chính
        form.setValue('categoryId', newCategory.id)

        // Gọi callback onSuccess để component cha cập nhật lại list
        onSuccess(updatedList)

        // Đóng dialog con và reset form danh mục
        setIsCategoryDialogOpen(false)
        categoryForm.reset()
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi khi tạo danh mục mới!')
    } finally {
      setCategoryLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-foreground'>
              <Apple className='size-5 text-emerald-600' />
              <span>{isEdit ? 'Chỉnh sửa thực phẩm' : 'Thêm thực phẩm mới'}</span>
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Cập nhật lại thông tin thực phẩm trong tủ lạnh của bạn.'
                : 'Điền đầy đủ thông tin bên dưới để thêm thực phẩm mới vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
              {/* Tên thực phẩm */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Tên thực phẩm *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: Thịt bò, Bắp cải, Sữa chua...'
                        {...field}
                        disabled={loading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Danh mục */}
                <FormField
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem className='flex flex-col justify-end'>
                      <div className='mb-1.5 flex items-center justify-between'>
                        <FormLabel className='text-xs font-semibold'>Danh mục *</FormLabel>
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='flex h-auto items-center gap-0.5 p-0 text-xs font-medium text-emerald-600 hover:text-emerald-700'
                          onClick={() => setIsCategoryDialogOpen(true)}
                        >
                          <Plus className='size-3' /> Tạo nhanh
                        </Button>
                      </div>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger className='h-9 text-sm'>
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
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />

                {/* Vị trí bảo quản */}
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='mb-1.5 block text-xs font-semibold'>
                        Vị trí bảo quản *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger className='h-9 text-sm'>
                            <SelectValue placeholder='Chọn vị trí' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(StorageLocation).map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {LOCATION_MAP[loc]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Số lượng */}
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-semibold'>Số lượng *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='ví dụ: 1 hoặc 1.5...'
                          {...field}
                          disabled={loading}
                          className='h-9 text-sm'
                        />
                      </FormControl>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />

                {/* Đơn vị */}
                <FormField
                  control={form.control}
                  name='unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-semibold'>Đơn vị tính *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='ví dụ: cái, kg, hộp...'
                          {...field}
                          disabled={loading}
                          className='h-9 text-sm'
                        />
                      </FormControl>
                      {/* Đơn vị gợi ý dưới dạng các Badge có thể click */}
                      <div className='mt-1.5 flex flex-wrap gap-1'>
                        {SUGGESTED_UNITS.map((u) => (
                          <Badge
                            key={u}
                            variant='outline'
                            className='cursor-pointer px-1.5 py-0 text-[10px] font-normal transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                            onClick={() => form.setValue('unit', u)}
                          >
                            {u}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Hạn sử dụng */}
                <FormField
                  control={form.control}
                  name='expiryDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-semibold'>Hạn sử dụng *</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type='date'
                            {...field}
                            disabled={loading}
                            className='h-9 pr-10 text-sm'
                          />
                          <CalendarIcon className='pointer-events-none absolute top-2.5 right-3 size-4 text-muted-foreground' />
                        </div>
                      </FormControl>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />

                {/* Người thêm (userId) */}
                <FormField
                  control={form.control}
                  name='userId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='mb-1.5 block text-xs font-semibold'>
                        Người thêm thực phẩm *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger className='h-9 text-sm'>
                            <SelectValue placeholder='Chọn người dùng' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} (@{u.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hướng dẫn bảo quản */}
              <FormField
                control={form.control}
                name='storageInstructions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Hướng dẫn bảo quản</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='ví dụ: Bảo quản ngăn đông đá, đậy kín nắp, rửa sạch trước khi bỏ vào tủ...'
                        {...field}
                        disabled={loading}
                        className='min-h-[60px] text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              {/* Ghi chú */}
              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='ví dụ: Mua cho cả tuần, ưu tiên ăn trước vào thứ 4...'
                        {...field}
                        disabled={loading}
                        className='min-h-[60px] text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              {/* Ảnh thực phẩm */}
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-semibold'>Hình ảnh thực phẩm</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                        folder='fridge-items'
                      />
                    </FormControl>
                    <FormDescription className='text-[10px] text-muted-foreground'>
                      Nếu không tải ảnh lên, hệ thống sẽ tự động gán ảnh minh họa đẹp mắt từ
                      Unsplash phù hợp với danh mục.
                    </FormDescription>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <DialogFooter className='gap-2 pt-4 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={loading}
                  onClick={() => onOpenChange(false)}
                  className='h-9 text-xs font-medium'
                >
                  Hủy bỏ
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='h-9 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700'
                >
                  {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                  {isEdit ? 'Lưu thay đổi' : 'Thêm thực phẩm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog con: Tạo nhanh Danh mục */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>Tạo danh mục mới</DialogTitle>
            <DialogDescription className='text-xs'>
              Thêm một danh mục thực phẩm mới để dễ dàng phân loại trong tủ lạnh.
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form
              onSubmit={categoryForm.handleSubmit(onQuickCategorySubmit)}
              className='space-y-4 py-2'
            >
              <FormField
                control={categoryForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Tên danh mục *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: Hải sản, Bánh kẹo...'
                        {...field}
                        disabled={categoryLoading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Biểu tượng (Emoji) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: 🦀, 🍞, 🥛...'
                        {...field}
                        disabled={categoryLoading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Mô tả danh mục</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: Các loại thực phẩm từ biển...'
                        {...field}
                        disabled={categoryLoading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <DialogFooter className='gap-2 pt-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={categoryLoading}
                  onClick={() => setIsCategoryDialogOpen(false)}
                  className='h-9 text-xs font-medium'
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={categoryLoading}
                  className='h-9 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700'
                >
                  {categoryLoading && <Loader2 className='mr-2 size-4 animate-spin' />}
                  Tạo danh mục
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
