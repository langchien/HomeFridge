'use client'

import { FridgeItemWithIngredient } from '@/app/actions/fridge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Filter, LayoutGrid, Plus, Search, Table2, X } from 'lucide-react'
import { FridgeItemDialog } from './fridge-item-dialog'
import { useState } from 'react'

const STATUS_OPTIONS = [
  {
    value: 'FRESH',
    label: 'Tươi mới',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  {
    value: 'EXPIRING_SOON',
    label: 'Sắp hết hạn',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  },
  {
    value: 'EXPIRED',
    label: 'Đã hết hạn',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
]

const LOCATION_OPTIONS = [
  { value: 'FREEZER', label: 'Ngăn đông' },
  { value: 'CHILLER', label: 'Ngăn mát' },
  { value: 'FRIDGE_SHELF', label: 'Kệ tủ lạnh' },
  { value: 'VEGETABLE_DRAWER', label: 'Ngăn rau' },
  { value: 'DOOR_SHELF', label: 'Kệ cửa tủ' },
  { value: 'PANTRY', label: 'Pantry' },
]

export type ViewMode = 'grid' | 'table'

interface FridgeToolbarProps {
  items: FridgeItemWithIngredient[]
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  statusFilter: string[]
  onStatusFilterChange: (statuses: string[]) => void
  locationFilter: string[]
  onLocationFilterChange: (locations: string[]) => void
}

export function FridgeToolbar({
  items,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
}: FridgeToolbarProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const activeFilterCount = statusFilter.length + locationFilter.length

  function toggleStatus(value: string) {
    if (statusFilter.includes(value)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== value))
    } else {
      onStatusFilterChange([...statusFilter, value])
    }
  }

  function toggleLocation(value: string) {
    if (locationFilter.includes(value)) {
      onLocationFilterChange(locationFilter.filter((l) => l !== value))
    } else {
      onLocationFilterChange([...locationFilter, value])
    }
  }

  function clearAllFilters() {
    onStatusFilterChange([])
    onLocationFilterChange([])
    onSearchChange('')
  }

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0

  return (
    <>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        {/* Left: Search + Filter */}
        <div className='flex flex-1 items-center gap-2'>
          {/* Search */}
          <div className='relative max-w-sm flex-1'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Tìm nguyên liệu...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='h-9 pr-9 pl-9'
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='size-3.5' />
              </button>
            )}
          </div>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='sm' className='h-9 gap-1.5 font-medium'>
                <Filter className='size-4' />
                Lọc
                {activeFilterCount > 0 && (
                  <Badge variant='secondary' className='ml-0.5 h-5 min-w-5 px-1 text-xs'>
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64 p-3' align='start'>
              {/* Trạng thái */}
              <div className='mb-3'>
                <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Trạng thái
                </p>
                <div className='flex flex-col gap-1'>
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = statusFilter.includes(opt.value)
                    const count = items.filter((i) => i.status === opt.value).length
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleStatus(opt.value)}
                        className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                          isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span className='flex items-center gap-2'>
                          <span
                            className={`inline-block size-2 rounded-full ${
                              opt.value === 'FRESH'
                                ? 'bg-green-500'
                                : opt.value === 'EXPIRING_SOON'
                                  ? 'bg-amber-400'
                                  : 'bg-red-500'
                            }`}
                          />
                          {opt.label}
                        </span>
                        <span className='text-xs text-muted-foreground'>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator className='my-2' />

              {/* Vị trí */}
              <div className='mb-3'>
                <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  Vị trí lưu trữ
                </p>
                <div className='flex flex-col gap-1'>
                  {LOCATION_OPTIONS.map((opt) => {
                    const isActive = locationFilter.includes(opt.value)
                    const count = items.filter((i) => i.storageLocation === opt.value).length
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleLocation(opt.value)}
                        className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                          isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {opt.label}
                        <span className='text-xs text-muted-foreground'>{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <>
                  <Separator className='my-2' />
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-full text-xs text-muted-foreground'
                    onClick={clearAllFilters}
                  >
                    <X className='mr-1.5 size-3' />
                    Xóa tất cả bộ lọc
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className='hidden items-center gap-1 sm:flex'>
              {statusFilter.map((s) => {
                const opt = STATUS_OPTIONS.find((o) => o.value === s)
                return opt ? (
                  <Badge
                    key={s}
                    variant='secondary'
                    className='h-7 cursor-pointer gap-1 pr-1.5 text-xs font-medium'
                    onClick={() => toggleStatus(s)}
                  >
                    {opt.label}
                    <X className='size-3' />
                  </Badge>
                ) : null
              })}
              {locationFilter.map((l) => {
                const opt = LOCATION_OPTIONS.find((o) => o.value === l)
                return opt ? (
                  <Badge
                    key={l}
                    variant='secondary'
                    className='h-7 cursor-pointer gap-1 pr-1.5 text-xs font-medium'
                    onClick={() => toggleLocation(l)}
                  >
                    {opt.label}
                    <X className='size-3' />
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Right: View Toggle + Add button */}
        <div className='flex items-center gap-2'>
          {/* Toggle Grid / Table */}
          <div className='flex rounded-lg border p-0.5'>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-7 w-8 rounded-md p-0'
              onClick={() => onViewModeChange('grid')}
              title='Chế độ lưới'
            >
              <LayoutGrid className='size-4' />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-7 w-8 rounded-md p-0'
              onClick={() => onViewModeChange('table')}
              title='Chế độ bảng'
            >
              <Table2 className='size-4' />
            </Button>
          </div>

          {/* Nút thêm */}
          <Button
            size='sm'
            className='h-9 gap-1.5 font-medium'
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className='size-4' />
            Thêm item
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <FridgeItemDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} item={null} />
    </>
  )
}
