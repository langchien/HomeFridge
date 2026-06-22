'use client'

import { DataTableColumnHeader } from '@/app/dashboard/user/components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Ingredient, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Clock, ExternalLink, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RecipeRowActions } from './recipe-row-actions'

export type RecipeIngredientWithRelation = RecipeIngredient & {
  ingredient: Ingredient
}

export type RecipeWithRelations = Recipe & {
  ingredients: RecipeIngredientWithRelation[]
}

export const columns: ColumnDef<RecipeWithRelations>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên công thức' />,
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-3'>
          {/* Thumbnail */}
          <div className='relative h-12 w-16 shrink-0 overflow-hidden rounded-lg'>
            {row.original.thumbnail ? (
              <Image
                src={row.original.thumbnail}
                alt={row.original.title}
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-secondary text-2xl'>
                🍳
              </div>
            )}
          </div>
          {/* Tên + mô tả ngắn */}
          <div className='min-w-0 flex-1'>
            <p className='max-w-[280px] truncate font-semibold'>{row.original.title}</p>
            {row.original.description && (
              <p className='max-w-[280px] truncate text-muted-foreground'>
                {row.original.description}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'ingredients',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Nguyên liệu' />,
    cell: ({ row }) => {
      const count = row.original.ingredients.length
      return (
        <Badge variant='outline' className='gap-1 font-normal'>
          🥕 {count} nguyên liệu
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'cookTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Thời gian' />,
    cell: ({ row }) => {
      const prep = row.original.prepTime
      const cook = row.original.cookTime
      const total = (prep || 0) + (cook || 0)
      if (!total) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='flex items-center gap-1 text-muted-foreground'>
          <Clock className='size-3.5' />
          <span>{total} phút</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'servings',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Khẩu phần' />,
    cell: ({ row }) => {
      const servings = row.original.servings
      if (!servings) return <span className='text-muted-foreground'>—</span>
      return (
        <div className='flex items-center gap-1 text-muted-foreground'>
          <Users className='size-3.5' />
          <span>{servings} người</span>
        </div>
      )
    },
  },
  {
    id: 'detail',
    cell: ({ row }) => (
      <Button size='sm' variant='ghost' asChild className='h-7 gap-1'>
        <Link href={`/dashboard/recipes/${row.original.id}`}>
          <ExternalLink className='size-3' />
          Chi tiết
        </Link>
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <RecipeRowActions row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
  },
]
