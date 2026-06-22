'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, UserPlus, Edit3 } from 'lucide-react'

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type User } from '../data/schema'
import { createUserAction, updateUserAction } from '@/app/actions/users'
import { ImageUpload } from '@/components/ui/image-upload'

// Định nghĩa schemas cho 2 trường hợp Add và Edit
const baseSchema = {
  username: z
    .string()
    .min(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' })
    .max(50, { message: 'Tên đăng nhập không được vượt quá 50 ký tự.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).',
    }),
  name: z
    .string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
    .max(100, { message: 'Họ tên không được vượt quá 100 ký tự.' }),
  email: z.string().email({ message: 'Email không đúng định dạng.' }).optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9+ ]*$/, { message: 'Số điện thoại chỉ được chứa số, khoảng trắng và dấu (+).' })
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN', 'MEMBER', 'DEVICE', 'HOMEMAKER'], {
    message: 'Vui lòng chọn vai trò người dùng.',
  }),
  avatar: z
    .string()
    .url({ message: 'Đường dẫn ảnh đại diện không hợp lệ.' })
    .optional()
    .or(z.literal('')),
}

const addSchema = z.object({
  ...baseSchema,
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }),
})

const editSchema = z.object({
  ...baseSchema,
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    .optional()
    .or(z.literal('')),
})

type AddFormValues = z.infer<typeof addSchema>
type EditFormValues = z.infer<typeof editSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null // Nếu null là thêm mới, ngược lại là chỉnh sửa
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  // Chọn schema thích hợp tùy thuộc vào mode
  const currentSchema = isEdit ? editSchema : addSchema

  const form = useForm<AddFormValues | EditFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      username: '',
      name: '',
      password: '',
      email: '',
      phone: '',
      role: 'MEMBER',
      avatar: '',
    },
  })

  // Cập nhật lại form values mỗi khi user prop thay đổi (khi bấm Edit một dòng khác)
  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          username: user.username || '',
          name: user.name || '',
          password: '', // Không điền sẵn password vì bảo mật
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'MEMBER',
          avatar: user.avatar || '',
        })
      } else {
        form.reset({
          username: '',
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'MEMBER',
          avatar: '',
        })
      }
    }
  }, [user, open, form])

  const onSubmit = async (values: AddFormValues | EditFormValues) => {
    setLoading(true)
    try {
      let result
      if (isEdit && user) {
        result = await updateUserAction(user.id, values)
      } else {
        result = await createUserAction(values)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isEdit
            ? `Cập nhật thông tin của "${values.name}" thành công!`
            : `Đã thêm người dùng "${values.name}" thành công!`,
        )
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình lưu thông tin người dùng!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
            {isEdit ? (
              <>
                <Edit3 className='size-5 text-primary' />
                <span>Chỉnh sửa thông tin người dùng</span>
              </>
            ) : (
              <>
                <UserPlus className='size-5 text-primary' />
                <span>Thêm người dùng mới</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Thay đổi các trường bên dưới để cập nhật thông tin thành viên.'
              : 'Điền đầy đủ thông tin bên dưới để tạo tài khoản người dùng mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Tên đăng nhập */}
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Tên đăng nhập *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: nguyenvanadmin'
                        {...field}
                        disabled={loading || isEdit} // Khóa khi edit
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              {/* Vai trò */}
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Vai trò *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className='h-9 text-sm'>
                          <SelectValue placeholder='Chọn vai trò' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='MEMBER'>Thành viên</SelectItem>
                        <SelectItem value='ADMIN'>Quản trị viên</SelectItem>
                        <SelectItem value='DEVICE'>Thiết bị</SelectItem>
                        <SelectItem value='HOMEMAKER'>Nội trợ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            {/* Họ và tên */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>Họ và tên *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ví dụ: Nguyễn Văn A'
                      {...field}
                      disabled={loading}
                      className='h-9 text-sm'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Mật khẩu */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>
                    {isEdit ? 'Mật khẩu mới (bỏ trống nếu giữ nguyên)' : 'Mật khẩu *'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder={isEdit ? '••••••••' : 'Nhập tối thiểu 6 ký tự'}
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
              {/* Email */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='ví dụ: user@gmail.com'
                        {...field}
                        disabled={loading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              {/* Số điện thoại */}
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold'>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ví dụ: 0987654321'
                        {...field}
                        disabled={loading}
                        className='h-9 text-sm'
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            {/* Ảnh đại diện (Upload Cloudinary) */}
            <FormField
              control={form.control}
              name='avatar'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel className='text-xs font-semibold'>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      folder='avatars'
                    />
                  </FormControl>
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
                className='h-9 bg-primary text-xs font-medium'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                {isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
