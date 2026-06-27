import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { RecipeDetailActions } from './components/recipe-detail-actions'

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'HOMEMAKER')) {
    redirect('/dashboard')
  }

  const { id } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          ingredient: {
            include: { category: true },
          },
        },
      },
    },
  })

  if (!recipe) {
    notFound()
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <div className='flex flex-col gap-6 pb-12'>
      {/* Back button */}
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' asChild className='gap-2'>
          <Link href='/dashboard/recipes'>
            <ArrowLeft className='size-4' />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      {/* Hero section */}
      <div className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        {/* Thumbnail hero */}
        <div className='relative h-64 w-full overflow-hidden bg-secondary/20 md:h-80'>
          {recipe.thumbnail ? (
            <Image
              src={recipe.thumbnail}
              alt={recipe.title}
              fill
              className='object-cover'
              priority
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-8xl'>🍳</div>
          )}
          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
          {/* Tiêu đề overlay */}
          <div className='absolute right-0 bottom-0 left-0 p-6'>
            <h1 className='text-2xl font-bold text-white drop-shadow-md md:text-3xl'>
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className='mt-1 text-white/80 drop-shadow'>{recipe.description}</p>
            )}
          </div>
        </div>

        {/* Info bar */}
        <div className='flex flex-wrap gap-4 border-t bg-card px-6 py-4'>
          {totalTime > 0 && (
            <div className='flex items-center gap-2'>
              <Clock className='size-4 text-amber-600' />
              <span className='font-medium'>{totalTime} phút</span>
              <span className='text-muted-foreground'>
                (chuẩn bị {recipe.prepTime || 0} + nấu {recipe.cookTime || 0})
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className='flex items-center gap-2'>
              <Users className='size-4 text-amber-600' />
              <span className='font-medium'>{recipe.servings} người</span>
            </div>
          )}
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>🥕</span>
            <span className='font-medium'>{recipe.ingredients.length} nguyên liệu</span>
          </div>

          {/* Admin actions */}
          <div className='ml-auto'>
            <RecipeDetailActions recipe={recipe as any} userRole={currentUser.role} />
          </div>
        </div>
      </div>

      {/* Content: 2 cột */}
      <div className='grid gap-6 md:grid-cols-5'>
        {/* Nguyên liệu — 2/5 */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg'>🥕 Nguyên liệu</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {recipe.ingredients.map((ri) => (
              <div key={ri.id} className='flex items-center gap-3 rounded-lg border p-2.5'>
                {/* Ảnh nhỏ */}
                <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary/50'>
                  {ri.ingredient.image ? (
                    <Image
                      src={ri.ingredient.image}
                      alt={ri.ingredient.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center text-lg'>
                      {ri.ingredient.category?.icon || '🍽️'}
                    </div>
                  )}
                </div>
                {/* Tên + danh mục */}
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium'>{ri.ingredient.name}</p>
                  <Badge variant='outline' className='mt-0.5 gap-0.5 text-xs font-normal'>
                    {ri.ingredient.category?.icon} {ri.ingredient.category?.name}
                  </Badge>
                </div>
                {/* Số lượng */}
                <span className='shrink-0 font-semibold text-amber-600'>
                  {ri.quantity} {ri.ingredient.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hướng dẫn — 3/5 */}
        <Card className='md:col-span-3'>
          <CardHeader>
            <CardTitle className='text-lg'>📋 Hướng dẫn nấu</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {recipe.instructions.map((step, index) => (
              <div key={index} className='flex gap-4'>
                {/* Số bước */}
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'>
                  {index + 1}
                </div>
                {/* Nội dung bước */}
                <div className='flex-1 pt-1'>
                  <p className='leading-relaxed'>{step}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
