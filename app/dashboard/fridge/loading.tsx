import { Skeleton } from '@/components/ui/skeleton'

export default function FridgeLoading() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div>
        <Skeleton className='mb-2 h-10 w-48' />
        <Skeleton className='h-5 w-96' />
      </div>

      {/* Stats Skeleton */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-32 w-full rounded-xl' />
        ))}
      </div>

      {/* View Skeleton */}
      <div className='mt-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-24' />
        </div>
        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className='h-48 w-full rounded-xl' />
          ))}
        </div>
      </div>
    </div>
  )
}
