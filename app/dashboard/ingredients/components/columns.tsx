'use client'

import { DataTableColumnHeader } from '@/app/dashboard/admin/components/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Category, Ingredient } from '@/generated/prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { IngredientRowActions } from './ingredient-row-actions'

export type IngredientWithRelations = Ingredient & {
  category: Category
}

export const columns: ColumnDef<IngredientWithRelations>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tên nguyên liệu' />,
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
          <span className='max-w-[300px] truncate font-medium'>{row.original.name}</span>
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
    accessorKey: 'unit',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Đơn vị' />,
    cell: ({ row }) => {
      return <span className='font-medium text-muted-foreground'>{row.original.unit}</span>
    },
  },
  {
    accessorKey: 'storageInstructions',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Cách bảo quản' />,
    cell: ({ row }) => {
      const instructions = row.original.storageInstructions
      return (
        <span
          className='block max-w-[250px] truncate text-muted-foreground'
          title={instructions || ''}
        >
          {instructions || '-'}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <IngredientRowActions row={row} table={table} />,
  },
]
