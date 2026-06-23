import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ShoppingLoading() {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='mb-2 h-9 w-64' />
          <Skeleton className='h-5 w-80' />
        </div>
      </div>

      <div className='mt-2 space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-10 w-32' />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center gap-4 border-b pb-4 last:border-0'>
                <Skeleton className='size-5 rounded' />
                <Skeleton className='size-10 rounded-md' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-8 w-24' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
