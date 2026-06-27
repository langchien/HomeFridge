'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Pencil, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RecipeWithRelations } from './columns'

interface RecipeGridCardProps {
  recipe: RecipeWithRelations
  onEdit: (recipe: RecipeWithRelations) => void
  userRole?: string
}

export function RecipeGridCard({ recipe, onEdit, userRole }: RecipeGridCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <div
      className={[
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm',
        'border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className='relative aspect-[4/3] w-full overflow-hidden bg-secondary/30'>
        {recipe.thumbnail ? (
          <Image
            src={recipe.thumbnail}
            alt={recipe.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-5xl'>🍳</div>
        )}

        {/* Badge thời gian overlay */}
        {totalTime > 0 && (
          <div className='absolute top-2 right-2'>
            <Badge className='gap-1 bg-black/70 text-white backdrop-blur-sm hover:bg-black/70'>
              <Clock className='size-3' />
              {totalTime} phút
            </Badge>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className='flex flex-1 flex-col gap-2 p-3'>
        {/* Tên công thức */}
        <p className='line-clamp-2 min-h-[40px] leading-snug font-semibold text-foreground'>
          {recipe.title}
        </p>

        {/* Thông tin */}
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className='gap-0.5 text-xs font-normal'>
            🥕 {recipe.ingredients.length} nguyên liệu
          </Badge>
          {recipe.servings && (
            <Badge variant='outline' className='gap-0.5 text-xs font-normal'>
              <Users className='size-2.5' />
              {recipe.servings} người
            </Badge>
          )}
        </div>

        {/* Mô tả ngắn */}
        {recipe.description && (
          <p className='line-clamp-2 text-sm text-muted-foreground'>{recipe.description}</p>
        )}

        {/* Nút */}
        <div className='mt-auto flex gap-2 pt-1'>
          {userRole === 'ADMIN' && (
            <Button
              size='sm'
              variant='outline'
              className='h-7 flex-1 gap-1.5 text-sm font-medium transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400'
              onClick={() => onEdit(recipe)}
            >
              <Pencil className='size-3' />
              Sửa
            </Button>
          )}
          <Button
            size='sm'
            variant='outline'
            asChild
            className='h-7 flex-1 gap-1.5 text-sm font-medium transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
          >
            <Link href={`/dashboard/recipes/${recipe.id}`}>
              <ExternalLink className='size-3' />
              Chi tiết
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
