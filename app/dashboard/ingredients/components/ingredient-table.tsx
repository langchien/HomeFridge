'use client'

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from '@/app/dashboard/admin/components/data-table-pagination'
import type { Category } from '@/generated/prisma/client'
import { type RowData } from '@tanstack/react-table'
import { LayoutGrid, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IngredientWithRelations } from './columns'
import { IngredientFormDialog } from './ingredient-form-dialog'
import { IngredientGridView } from './ingredient-grid-view'
import { IngredientTableToolbar } from './ingredient-table-toolbar'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEditRow?: (item: TData) => void
  }
}

type ViewMode = 'list' | 'grid'

const VIEW_MODE_KEY = 'ingredient-view-mode'

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list'
  return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'list'
}

interface IngredientTableProps {
  columns: ColumnDef<IngredientWithRelations, any>[]
  data: IngredientWithRelations[]
  categories: Category[]
}

export function IngredientTable({ columns, data, categories }: IngredientTableProps) {
  const router = useRouter()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // View mode state — khởi tạo lazy để đọc localStorage chỉ phía client
  const [viewMode, setViewMode] = React.useState<ViewMode>('list')

  // Khởi tạo viewMode từ localStorage sau khi mount
  React.useEffect(() => {
    setViewMode(getInitialViewMode())
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  // Dialog states
  const [isAddEditOpen, setIsAddEditOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<IngredientWithRelations | null>(null)

  // Categories state với sync từ props
  const [prevCategories, setPrevCategories] = React.useState<Category[]>(categories)
  const [categoriesState, setCategoriesState] = React.useState<Category[]>(categories)

  if (categories !== prevCategories) {
    setPrevCategories(categories)
    setCategoriesState(categories)
  }

  const handleEdit = (item: IngredientWithRelations) => {
    setSelectedItem(item)
    setIsAddEditOpen(true)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    meta: {
      onEditRow: handleEdit as any,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='flex flex-col gap-4'>
      {/* Header: Tiêu đề + Toggle View */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Danh sách nguyên liệu</h2>
        <div className='flex items-center gap-1 rounded-lg border bg-card p-1'>
          <button
            onClick={() => handleViewModeChange('list')}
            aria-label='Dạng bảng'
            className={[
              'flex h-7 w-7 items-center justify-center rounded-md transition-all',
              viewMode === 'list'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <List className='size-4' />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            aria-label='Dạng lưới'
            className={[
              'flex h-7 w-7 items-center justify-center rounded-md transition-all',
              viewMode === 'grid'
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <LayoutGrid className='size-4' />
          </button>
        </div>
      </div>

      {/* Toolbar: search + filters */}
      <IngredientTableToolbar table={table} categories={categoriesState} />

      {/* Nội dung theo view mode */}
      {viewMode === 'list' ? (
        <>
          <div className='overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center text-muted-foreground'
                    >
                      Không có dữ liệu hiển thị.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      ) : (
        <IngredientGridView
          items={table.getFilteredRowModel().rows.map((r) => r.original)}
          onEdit={handleEdit}
        />
      )}

      {/* Dialog: Thêm/Chỉnh sửa */}
      <IngredientFormDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        item={selectedItem}
        categories={categoriesState}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
