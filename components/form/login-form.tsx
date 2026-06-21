'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginAction } from '@/app/actions/auth'

// 1. Định nghĩa Schema xác thực với Zod
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Tên tài khoản phải từ 3 ký tự trở lên.' }),
  password: z.string().min(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên.' }),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2. Khởi tạo React Hook Form kết hợp Zod resolver
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // 3. Xử lý submit form bằng Server Action
  const onSubmit = async (values: LoginValues) => {
    setError('')
    setLoading(true)

    try {
      const res = await loginAction(values)

      if (res.error) {
        throw new Error(res.error)
      }

      // Đăng nhập thành công, chuyển hướng người dùng
      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold'>HomieFridge</CardTitle>
        <CardDescription>Hệ thống quản lý phòng & tủ lạnh nội bộ</CardDescription>
      </CardHeader>

      <CardContent className='grid gap-4'>
        {error && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive'>
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Tên đăng nhập (ví dụ: admin)'
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className='flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground'>
        <div className='w-full space-y-1'>
          <span className='font-semibold text-foreground'>💡 Tài khoản mẫu:</span>
          <p>
            • Admin: <code className='font-mono'>admin</code> /{' '}
            <code className='font-mono'>admin123</code>
          </p>
          <p>
            • Thiết bị: <code className='font-mono'>device_fridge</code> /{' '}
            <code className='font-mono'>fridge123</code>
          </p>
        </div>
        <p className='mt-2 text-center text-[10px]'>
          HomieFridge v0.0.1 • Chỉ lưu hành nội bộ trong phòng
        </p>
      </CardFooter>
    </Card>
  )
}
