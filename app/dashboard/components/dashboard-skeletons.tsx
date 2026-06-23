import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {[...Array(4)].map((_, i) => (
        <Card key={i} className='border-muted/60 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='size-4' />
          </CardHeader>
          <CardContent>
            <Skeleton className='mb-1 h-8 w-20' />
            <Skeleton className='h-3 w-32' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <Card className='col-span-full border-muted/60 shadow-sm md:col-span-1'>
      <CardHeader>
        <Skeleton className='mb-2 h-6 w-40' />
        <Skeleton className='h-4 w-64' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[250px] w-full rounded-full' />
      </CardContent>
    </Card>
  )
}

export function DashboardTablesSkeleton() {
  return (
    <div className='col-span-full grid grid-cols-1 gap-4 md:col-span-2 lg:grid-cols-2'>
      {[...Array(2)].map((_, i) => (
        <Card key={i} className='border-muted/60 shadow-sm'>
          <CardHeader>
            <Skeleton className='mb-2 h-6 w-48' />
            <Skeleton className='h-4 w-56' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(3)].map((_, j) => (
              <div key={j} className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'>
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
