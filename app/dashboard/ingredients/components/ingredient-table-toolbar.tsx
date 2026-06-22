'use client'

import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { DataTableFacetedFilter } from '@/app/dashboard/admin/components/data-table-faceted-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Category } from '@/generated/prisma/client'
import { IngredientTableViewOptions } from './ingredient-table-view-options'

interface IngredientTableToolbarProps<TData> {
  table: Table<TData>
  categories: Category[]
}

export function IngredientTableToolbar<TData>({
  table,
  categories,
}: IngredientTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const categoryOptions = categories.map((cat) => ({
    label: `${cat.icon || '📦'} ${cat.name}`,
    value: cat.id,
  }))

  return (
    <div className='flex flex-col gap-3 pb-4'>
      {/* Search + Filters */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên nguyên liệu...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='h-8 w-[160px] lg:w-[240px]'
          />
          {/* Filter Category */}
          {table.getColumn('category') && categoryOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('category')}
              title='Danh mục'
              options={categoryOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                table.resetColumnFilters()
              }}
              className='flex h-8 items-center gap-1 px-2 text-muted-foreground lg:px-3'
            >
              <span>Đặt lại</span>
              <X className='size-4' />
            </Button>
          )}
        </div>
        <div className='flex items-center justify-end gap-2'>
          <IngredientTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}
