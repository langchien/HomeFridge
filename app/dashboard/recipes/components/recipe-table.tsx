'use client'

import {
  flexRender,
  getCoreRowModel,
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

import { DataTablePagination } from '@/app/dashboard/user/components/data-table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Ingredient } from '@/generated/prisma/client'
import { type RowData } from '@tanstack/react-table'
import { LayoutGrid, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type RecipeWithRelations } from './columns'
import { RecipeFormDialog } from './recipe-form-dialog'
import { RecipeGridCard } from './recipe-grid-card'
import { RecipeTableToolbar } from './recipe-table-toolbar'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEditRow?: (item: TData) => void
  }
}

type ViewMode = 'list' | 'grid'
const VIEW_MODE_KEY = 'recipe-view-mode'

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list'
  return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'list'
}

interface RecipeTableProps {
  columns: ColumnDef<RecipeWithRelations, any>[]
  data: RecipeWithRelations[]
  ingredients: Ingredient[]
  userRole?: string
}

export function RecipeTable({ columns, data, ingredients, userRole }: RecipeTableProps) {
  const router = useRouter()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [viewMode, setViewMode] = React.useState<ViewMode>('list')

  React.useEffect(() => {
    setViewMode(getInitialViewMode())
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  // Dialog states
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedRecipe, setSelectedRecipe] = React.useState<RecipeWithRelations | null>(null)

  const handleEdit = (recipe: RecipeWithRelations) => {
    setSelectedRecipe(recipe)
    setIsFormOpen(true)
  }

  const filteredColumns = React.useMemo(() => {
    if (userRole === 'ADMIN') return columns
    return columns.filter((col: any) => col.id !== 'actions')
  }, [columns, userRole])

  const table = useReactTable({
    data,
    columns: filteredColumns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    meta: { onEditRow: handleEdit as any },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredRows = table.getFilteredRowModel().rows.map((r) => r.original)

  return (
    <div className='flex flex-col gap-4'>
      {/* Header: Toggle View */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Danh sách công thức</h2>
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

      {/* Toolbar */}
      <RecipeTableToolbar table={table} />

      {/* Nội dung */}
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
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {filteredRows.length > 0 ? (
            filteredRows.map((recipe) => (
              <RecipeGridCard key={recipe.id} recipe={recipe} onEdit={handleEdit} userRole={userRole} />
            ))
          ) : (
            <div className='col-span-full py-12 text-center text-muted-foreground'>
              Không có công thức nào.
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <RecipeFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setSelectedRecipe(null)
        }}
        recipe={selectedRecipe}
        ingredients={ingredients}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
