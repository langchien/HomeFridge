'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconFridge } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'

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
      <CardHeader className='space-y-4 text-center'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-sm dark:bg-green-900/30'>
          <IconFridge className='h-8 w-8 text-green-600 dark:text-green-400' />
        </div>
        <div className='space-y-1'>
          <CardTitle className='text-3xl font-extrabold tracking-tight text-foreground'>
            Home<span className='text-green-600 dark:text-green-500'>Fridge</span>
          </CardTitle>
          <CardDescription className='font-medium text-muted-foreground'>
            Hệ thống quản lý phòng & tủ lạnh nội bộ
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className='grid gap-4'>
        {error && (
          <div className='rounded-md bg-destructive/15 p-3 font-medium text-destructive'>
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

      <CardFooter className='flex justify-center border-t pt-4 text-muted-foreground'>
        <p className='text-center text-xs'>HomieFridge v0.0.1 • Chỉ lưu hành nội bộ trong phòng</p>
      </CardFooter>
    </Card>
  )
}
