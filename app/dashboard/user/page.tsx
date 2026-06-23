import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChefHat, Shield, Smartphone, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { UserTable } from './components/user-table'

export default async function UserPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/')
  }

  // Lấy toàn bộ người dùng từ database
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Thống kê nhanh
  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const homemakerCount = users.filter((u) => u.role === 'HOMEMAKER').length
  const memberCount = users.filter((u) => u.role === 'MEMBER').length
  const deviceCount = users.filter((u) => u.role === 'DEVICE').length

  // Serialize dates sang chuỗi ISO để chuyển giao giữa Server và Client Component
  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))

  return (
    <>
      {/* Title and Intro */}
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
          Quản trị người dùng
        </h1>
        <p className='max-w-2xl text-muted-foreground'>
          Quản lý thông tin tài khoản người dùng, thiết bị dùng chung và thiết lập phân quyền truy
          cập hệ thống HomeFridge.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card className='border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-semibold tracking-wider text-muted-foreground uppercase'>
              Tổng tài khoản
            </CardTitle>
            <Users className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-foreground'>{totalUsers}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Người dùng và thiết bị trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-semibold tracking-wider text-muted-foreground uppercase'>
              Quản trị viên
            </CardTitle>
            <Shield className='size-4 text-rose-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-rose-500'>{adminCount}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Có toàn quyền quản lý hệ thống</p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-semibold tracking-wider text-muted-foreground uppercase'>
              Người nội trợ
            </CardTitle>
            <ChefHat className='size-4 text-teal-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-teal-500'>{homemakerCount}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Quản lý tủ lạnh & đi chợ gia đình</p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-semibold tracking-wider text-muted-foreground uppercase'>
              Thành viên
            </CardTitle>
            <Users className='size-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-500'>{memberCount}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Tài khoản gia đình, người dùng</p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='font-semibold tracking-wider text-muted-foreground uppercase'>
              Thiết bị tủ lạnh
            </CardTitle>
            <Smartphone className='size-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-500'>{deviceCount}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Tài khoản kết nối thiết bị thông minh
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Table container */}
      <div className='rounded-xl border bg-card p-6 text-card-foreground shadow-sm'>
        <UserTable data={serializedUsers} />
      </div>
    </>
  )
}
