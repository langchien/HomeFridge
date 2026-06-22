'use client'

import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FridgeTableViewOptions } from './fridge-table-view-options'
import { DataTableFacetedFilter } from '@/app/admin/components/data-table-faceted-filter'
import type { Category } from '@/generated/prisma/client'

export type ExpiryFilter = 'all' | 'valid' | 'expiring' | 'expired'

interface FridgeTableToolbarProps<TData> {
  table: Table<TData>
  categories: Category[]
  expiryFilter: ExpiryFilter
  onExpiryFilterChange: (filter: ExpiryFilter) => void
}

const locations = [
  { label: 'Tủ đông', value: 'FREEZER' },
  { label: 'Ngăn mát (Chiller)', value: 'CHILLER' },
  { label: 'Ngăn kệ', value: 'FRIDGE_SHELF' },
  { label: 'Ngăn rau củ', value: 'VEGETABLE_DRAWER' },
  { label: 'Ngăn cửa', value: 'DOOR_SHELF' },
  { label: 'Tủ bếp', value: 'PANTRY' },
]

const expiryTabs: { label: string; value: ExpiryFilter; className: string }[] = [
  {
    label: 'Tất cả',
    value: 'all',
    className:
      'data-[active=true]:bg-foreground data-[active=true]:text-background',
  },
  {
    label: '✅ Còn hạn',
    value: 'valid',
    className:
      'data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500',
  },
  {
    label: '⚠️ Sắp hết hạn',
    value: 'expiring',
    className:
      'data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500',
  },
  {
    label: '🚫 Đã hết hạn',
    value: 'expired',
    className:
      'data-[active=true]:bg-destructive data-[active=true]:text-destructive-foreground data-[active=true]:border-destructive',
  },
]

export function FridgeTableToolbar<TData>({
  table,
  categories,
  expiryFilter,
  onExpiryFilterChange,
}: FridgeTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || expiryFilter !== 'all'

  const categoryOptions = categories.map((cat) => ({
    label: `${cat.icon || '📦'} ${cat.name}`,
    value: cat.id,
  }))

  return (
    <div className='flex flex-col gap-3 pb-4'>
      {/* Hàng 1: Tab filter hạn sử dụng */}
      <div className='flex flex-wrap items-center gap-1.5'>
        {expiryTabs.map((tab) => (
          <button
            key={tab.value}
            data-active={expiryFilter === tab.value}
            onClick={() => onExpiryFilterChange(tab.value)}
            className={[
              'inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-medium transition-all',
              'border-border bg-background text-muted-foreground',
              'hover:bg-secondary hover:text-foreground',
              tab.className,
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hàng 2: Search + Filters */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên thực phẩm...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='h-8 w-[160px] text-xs lg:w-[240px]'
          />
          {/* Filter Category */}
          {table.getColumn('category') && categoryOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('category')}
              title='Danh mục'
              options={categoryOptions}
            />
          )}
          {/* Filter Vị trí */}
          {table.getColumn('location') && (
            <DataTableFacetedFilter
              column={table.getColumn('location')}
              title='Vị trí'
              options={locations}
            />
          )}
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                table.resetColumnFilters()
                onExpiryFilterChange('all')
              }}
              className='flex h-8 items-center gap-1 px-2 text-xs text-muted-foreground lg:px-3'
            >
              <span>Đặt lại</span>
              <X className='size-4' />
            </Button>
          )}
        </div>
        <div className='flex items-center justify-end gap-2'>
          <FridgeTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}
