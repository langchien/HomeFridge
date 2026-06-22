import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'HOMEMAKER') {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <p className='mt-2 text-muted-foreground'>Trang quản lý dành cho Người nội trợ</p>
    </div>
  )
}
