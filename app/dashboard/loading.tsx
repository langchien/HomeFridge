import {
  DashboardChartSkeleton,
  DashboardStatsSkeleton,
  DashboardTablesSkeleton,
} from './components/dashboard-skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div>
        <Skeleton className='mb-2 h-9 w-48' />
        <Skeleton className='h-5 w-72' />
      </div>

      <div className='flex flex-col gap-6'>
        <DashboardStatsSkeleton />

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <DashboardChartSkeleton />
          <DashboardTablesSkeleton />
        </div>
      </div>
    </div>
  )
}
