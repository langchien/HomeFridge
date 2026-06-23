import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MenuLoading() {
  return (
    <div className='flex flex-col gap-6 p-6 pb-16'>
      <div className='flex items-center gap-3'>
        <Skeleton className='size-10 rounded-xl' />
        <div>
          <Skeleton className='mb-2 h-9 w-64' />
          <Skeleton className='h-5 w-80' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-3 sm:grid-cols-3'>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className='shadow-sm'>
            <CardHeader className='pb-1'>
              <Skeleton className='mb-2 h-10 w-16' />
              <Skeleton className='h-5 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-4 w-48' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Skeleton */}
      <div className='mt-4 space-y-4'>
        <Skeleton className='h-12 w-full rounded-lg' />
        <div className='grid gap-4 md:grid-cols-7'>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className='h-40 w-full rounded-xl' />
          ))}
        </div>
      </div>
    </div>
  )
}
