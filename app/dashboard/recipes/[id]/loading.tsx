import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function RecipeDetailLoading() {
  return (
    <div className='flex flex-col gap-6 pb-12'>
      {/* Back button */}
      <div className='flex items-center gap-3'>
        <Skeleton className='h-9 w-40' />
      </div>

      {/* Hero section */}
      <div className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        {/* Thumbnail hero */}
        <Skeleton className='h-64 w-full md:h-80' />

        {/* Info bar */}
        <div className='flex flex-wrap gap-4 border-t bg-card px-6 py-4'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-6 w-40' />
          <div className='ml-auto'>
            <Skeleton className='h-9 w-24' />
          </div>
        </div>
      </div>

      {/* Content: 2 cột */}
      <div className='grid gap-6 md:grid-cols-5'>
        {/* Nguyên liệu — 2/5 */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center gap-3 rounded-lg border p-2.5'>
                <Skeleton className='size-10 shrink-0 rounded-md' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <Skeleton className='h-5 w-16' />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hướng dẫn — 3/5 */}
        <Card className='md:col-span-3'>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='flex gap-4'>
                <Skeleton className='size-8 shrink-0 rounded-full' />
                <div className='flex-1 space-y-2 pt-1'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-5/6' />
                  <Skeleton className='h-4 w-4/5' />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
