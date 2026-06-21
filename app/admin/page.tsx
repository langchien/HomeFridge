import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-xl'>
        <CardHeader className='text-center'>
          <div className='mb-2 flex justify-center'>
            <Badge variant='destructive'>Khu vực quản trị</Badge>
          </div>
          <CardTitle className='text-2xl font-bold'>Admin Dashboard</CardTitle>
          <CardDescription>Trang quản trị hệ thống nội bộ HomieFridge</CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='space-y-2 rounded-lg border bg-muted/40 p-4'>
            <h3 className='font-semibold text-foreground'>Thông tin Admin đang đăng nhập:</h3>
            <p className='text-sm text-muted-foreground'>
              Tên: <span className='font-medium text-foreground'>{user.name}</span>
            </p>
            <p className='text-sm text-muted-foreground'>
              Tài khoản: <span className='font-mono text-foreground'>@{user.username}</span>
            </p>
            <p className='text-sm text-muted-foreground'>
              Email: <span className='text-foreground'>{user.email || 'Chưa cấu hình'}</span>
            </p>
          </div>
          <p className='text-center text-xs text-muted-foreground'>
            Trang này chỉ hiển thị khi tài khoản có quyền ADMIN. Mọi lượt truy cập trái phép đều
            được chặn từ Middleware.
          </p>
        </CardContent>

        <CardFooter className='flex justify-center border-t pt-6'>
          <Link href='/'>
            <Button variant='outline'>Quay lại Trang chủ</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
