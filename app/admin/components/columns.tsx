'use client'

import { type ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Chọn tất cả'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Chọn dòng'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Người dùng' />,
    cell: ({ row }) => {
      const name = (row.getValue('name') as string) || ''
      const username = row.original.username
      const avatar = row.original.avatar

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='size-8 border border-muted/50'>
            <AvatarImage src={avatar || ''} alt={name} />
            <AvatarFallback className='bg-primary/10 text-xs font-semibold text-primary'>
              {name ? name.substring(0, 2).toUpperCase() : 'US'}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm leading-tight font-medium text-foreground'>{name}</span>
            <span className='mt-0.5 text-xs text-muted-foreground'>@{username}</span>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      if (!email) {
        return <span className='text-xs text-muted-foreground/50 italic'>Chưa cấu hình</span>
      }
      return <span className='text-sm text-foreground'>{email}</span>
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Số điện thoại' />,
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      if (!phone) {
        return <span className='text-xs text-muted-foreground/50 italic'>Chưa cấu hình</span>
      }
      return <span className='font-mono text-sm text-foreground'>{phone}</span>
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Vai trò' />,
    cell: ({ row }) => {
      const roleValue = row.getValue('role') as string
      const role = roles.find((r) => r.value === roleValue)

      if (!role) return null

      const Icon = role.icon
      return (
        <div className='flex items-center gap-2'>
          <Icon className='size-4 text-muted-foreground' />
          <Badge
            variant={
              roleValue === 'ADMIN'
                ? 'destructive'
                : roleValue === 'DEVICE'
                  ? 'secondary'
                  : 'outline'
            }
            className={`text-xs font-normal ${
              roleValue === 'HOMEMAKER'
                ? 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30'
                : ''
            }`}
          >
            {role.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ngày tạo' />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className='font-mono text-xs text-muted-foreground'>
          {date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
  },
]
