import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function IngredientsLoading() {
  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='mb-2 h-9 w-64' />
          <Skeleton className='h-5 w-80' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-2 md:grid-cols-3'>
        <Card className='border-muted/60 shadow-sm md:col-span-1'>
          <CardHeader className='pb-2'>
            <Skeleton className='mb-2 h-10 w-16' />
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm md:col-span-2'>
          <CardHeader className='pb-2'>
            <Skeleton className='mb-2 h-7 w-40' />
            <Skeleton className='h-5 w-48' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-4/5' />
          </CardContent>
        </Card>
      </div>

      {/* Table Skeleton */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-24' />
        </div>
        <Skeleton className='h-[400px] w-full rounded-xl' />
      </div>
    </div>
  )
}
