'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'

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
import { type User } from '../data/schema'
import { resetPasswordAction } from '@/app/actions/users'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }),
    confirmPassword: z.string().min(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp.',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess: () => void
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Reset form mỗi khi mở dialog
  useEffect(() => {
    if (open) {
      form.reset({
        password: '',
        confirmPassword: '',
      })
    }
  }, [open, form])

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!user) return
    setLoading(true)
    try {
      const result = await resetPasswordAction(user.id, values.password)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã đặt lại mật khẩu cho tài khoản "${user.name}" thành công!`)
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã xảy ra lỗi trong quá trình đặt lại mật khẩu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
            <KeyRound className='size-5 text-amber-500' />
            <span>Đặt lại mật khẩu</span>
          </DialogTitle>
          <DialogDescription>
            Đặt lại mật khẩu mới cho tài khoản của <strong>{user?.name}</strong> (
            <strong>@{user?.username}</strong>).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            {/* Mật khẩu mới */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>Mật khẩu mới *</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Nhập tối thiểu 6 ký tự'
                      {...field}
                      disabled={loading}
                      className='h-9 text-sm'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            {/* Xác nhận mật khẩu mới */}
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>Xác nhận mật khẩu mới *</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Nhập lại mật khẩu mới'
                      {...field}
                      disabled={loading}
                      className='h-9 text-sm'
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
                className='h-9 bg-amber-500 text-xs font-medium text-white hover:bg-amber-600'
              >
                {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
