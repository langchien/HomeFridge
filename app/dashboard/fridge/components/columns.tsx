'use client'

import { DataTableColumnHeader } from '@/app/admin/components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Category, FridgeItem, User } from '@/generated/prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

import { FridgeRowActions } from './fridge-row-actions'

export type FridgeItemWithRelations = FridgeItem & {
  category: Category
  user: User
}

export const columns: ColumnDef<FridgeItemWithRelations>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên thực phẩm' />,
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-3'>
          {row.original.image ? (
            <div className='relative h-10 w-10 overflow-hidden rounded-md'>
              <Image
                src={row.original.image}
                alt={row.original.name}
                fill
                className='object-cover'
              />
            </div>
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground'>
              {row.original.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className='max-w-[200px] truncate font-medium'>{row.original.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Danh mục' />,
    cell: ({ row }) => {
      const category = row.original.category
      return (
        <Badge variant='outline' className='flex w-fit items-center gap-1 font-normal'>
          {category.icon && <span>{category.icon}</span>}
          <span>{category.name}</span>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.categoryId)
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Vị trí' />,
    cell: ({ row }) => {
      const locationMap: Record<string, string> = {
        FREEZER: 'Tủ đông',
        CHILLER: 'Ngăn mát (Chiller)',
        FRIDGE_SHELF: 'Ngăn kệ',
        VEGETABLE_DRAWER: 'Ngăn rau củ',
        DOOR_SHELF: 'Ngăn cửa',
        PANTRY: 'Tủ bếp',
      }
      return <span>{locationMap[row.original.location] || row.original.location}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.location)
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Số lượng' />,
    cell: ({ row }) => {
      return (
        <span>
          {row.original.quantity} {row.original.unit}
        </span>
      )
    },
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hạn sử dụng' />,
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate
      if (!expiryDate) return <span className='text-xs text-muted-foreground'>Không có</span>

      const isExpired = new Date(expiryDate) < new Date()
      const isExpiringSoon =
        new Date(expiryDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && !isExpired

      return (
        <div className='flex items-center gap-2'>
          <span
            className={
              isExpired
                ? 'font-medium text-destructive'
                : isExpiringSoon
                  ? 'font-medium text-amber-500'
                  : ''
            }
          >
            {new Date(expiryDate).toLocaleDateString('vi-VN')}
          </span>
          {isExpired && (
            <Badge variant='destructive' className='text-[10px] uppercase'>
              Hết hạn
            </Badge>
          )}
          {isExpiringSoon && (
            <Badge
              variant='outline'
              className='border-amber-500 text-[10px] text-amber-500 uppercase'
            >
              Sắp hết hạn
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Người thêm' />,
    cell: ({ row }) => {
      return <span>{row.original.user.name}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <FridgeRowActions row={row} table={table} />,
  },
]
