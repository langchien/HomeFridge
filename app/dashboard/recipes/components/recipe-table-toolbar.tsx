'use client'

import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RecipeTableToolbarProps<TData> {
  table: Table<TData>
}

export function RecipeTableToolbar<TData>({ table }: RecipeTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex flex-col gap-3 pb-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên công thức...'
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='h-8 w-[200px] lg:w-[280px]'
          />
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => table.resetColumnFilters()}
              className='flex h-8 items-center gap-1 px-2 text-muted-foreground lg:px-3'
            >
              <span>Đặt lại</span>
              <X className='size-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
