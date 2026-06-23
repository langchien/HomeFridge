import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DashboardChart } from './components/dashboard-chart'
import {
  DashboardChartSkeleton,
  DashboardStatsSkeleton,
  DashboardTablesSkeleton,
} from './components/dashboard-skeletons'
import { DashboardStats } from './components/dashboard-stats'
import { DashboardTables } from './components/dashboard-tables'

export const metadata = {
  title: 'Tổng quan | HomeFridge',
  description: 'Trang tổng quan hệ thống HomeFridge',
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  // Hiển thị dashboard HOMEMAKER cho cả ADMIN và HOMEMAKER
  if (currentUser.role !== 'HOMEMAKER' && currentUser.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Tổng quan</h1>
        <p className='text-muted-foreground'>Quản lý tình trạng thực phẩm và thực đơn gia đình</p>
      </div>

      <div className='flex flex-col gap-6'>
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <Suspense fallback={<DashboardChartSkeleton />}>
            <DashboardChart />
          </Suspense>

          <Suspense fallback={<DashboardTablesSkeleton />}>
            <DashboardTables />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
