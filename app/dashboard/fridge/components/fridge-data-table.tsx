'use no memo'
'use client'

import { FridgeItemWithIngredient, deleteFridgeItemAction } from '@/app/actions/fridge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit2, Package, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FridgeItemDialog } from './fridge-item-dialog'
import { StatusBadge } from './status-badge'

const LOCATION_LABELS: Record<string, string> = {
  FREEZER: 'Ngăn đông',
  CHILLER: 'Ngăn mát',
  FRIDGE_SHELF: 'Kệ tủ',
  VEGETABLE_DRAWER: 'Ngăn rau',
  DOOR_SHELF: 'Kệ cửa',
  PANTRY: 'Pantry',
}

interface FridgeDataTableProps {
  items: FridgeItemWithIngredient[]
}

export function FridgeDataTable({ items }: FridgeDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [itemToEdit, setItemToEdit] = useState<FridgeItemWithIngredient | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteFridgeItemAction(id)
    setDeletingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Đã xóa nguyên liệu khỏi tủ lạnh')
    }
  }

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('vi-VN')

  const getDaysRemaining = (expiryDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const columns = useMemo<ColumnDef<FridgeItemWithIngredient>[]>(
    () => [
      {
        accessorKey: 'ingredient.name',
        id: 'name',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-3 h-8 font-semibold hover:bg-transparent'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nguyên liệu
            <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground' />
          </Button>
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-base'>
              {row.original.ingredient.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.original.ingredient.image}
                  alt={row.original.ingredient.name}
                  className='size-6 rounded object-cover'
                />
              ) : (
                '🧊'
              )}
            </div>
            <span className='font-medium'>{row.original.ingredient.name}</span>
          </div>
        ),
      },
      {
        id: 'quantity',
        accessorKey: 'quantity',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-3 h-8 font-semibold hover:bg-transparent'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Số lượng
            <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground' />
          </Button>
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.quantity}
            <span className='ml-0.5 text-xs text-muted-foreground'>{row.original.unit}</span>
          </span>
        ),
      },
      {
        id: 'storageLocation',
        accessorKey: 'storageLocation',
        header: () => <span className='font-semibold'>Vị trí</span>,
        cell: ({ row }) => (
          <Badge variant='outline' className='font-normal'>
            {LOCATION_LABELS[row.original.storageLocation] ?? row.original.storageLocation}
          </Badge>
        ),
      },
      {
        id: 'expiryDate',
        accessorKey: 'expiryDate',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-3 h-8 font-semibold hover:bg-transparent'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ngày HH
            <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground' />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.expiryDate),
      },
      {
        id: 'daysRemaining',
        header: () => <span className='font-semibold'>Còn lại</span>,
        cell: ({ row }) => {
          const days = getDaysRemaining(row.original.expiryDate)
          if (days < 0)
            return (
              <span className='text-xs font-semibold text-red-600'>
                {Math.abs(days)} ngày trước
              </span>
            )
          if (days === 0) return <span className='text-xs font-semibold text-red-600'>Hôm nay</span>
          if (days <= 3)
            return <span className='text-xs font-semibold text-amber-600'>{days} ngày</span>
          return <span className='text-xs text-muted-foreground'>{days} ngày</span>
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => <span className='font-semibold'>Trạng thái</span>,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className='sr-only'>Hành động</span>,
        cell: ({ row }) => (
          <div className='flex items-center gap-1.5'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 hover:bg-muted'
              onClick={() => setItemToEdit(row.original)}
              title='Chỉnh sửa'
            >
              <Edit2 className='size-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50'
              onClick={() => handleDelete(row.original.id)}
              disabled={deletingId === row.original.id}
              title='Xóa'
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        ),
      },
    ],
    [deletingId], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
        <Package className='size-12 text-muted-foreground/40' />
        <p className='text-base font-medium text-muted-foreground'>Không có nguyên liệu nào</p>
        <p className='text-sm text-muted-foreground/70'>
          Thử thay đổi bộ lọc hoặc thêm nguyên liệu mới.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-muted/40 hover:bg-muted/40'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-xs'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className='transition-colors hover:bg-muted/30'>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='py-3 text-sm'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className='flex items-center justify-between px-1 py-2'>
          <p className='text-xs text-muted-foreground'>
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} •{' '}
            {items.length} nguyên liệu
          </p>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <FridgeItemDialog
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
        item={itemToEdit}
      />
    </>
  )
}
