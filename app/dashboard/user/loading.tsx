import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function UserLoading() {
  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <Skeleton className='mb-1 h-10 w-64' />
        <Skeleton className='h-5 w-96' />
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className='border-muted/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='size-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-1.5 h-8 w-12' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='mt-6 rounded-xl border bg-card p-6 shadow-sm'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-10 w-24' />
          </div>
          <Skeleton className='h-[400px] w-full rounded-xl' />
        </div>
      </div>
    </>
  )
}
