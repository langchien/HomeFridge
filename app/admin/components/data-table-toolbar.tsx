'use client'

import { type Table } from '@tanstack/react-table'
import { FileDown, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

import { roles } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleExportExcel = () => {
    try {
      // Lấy danh sách dòng hiện tại sau khi đã lọc và sắp xếp
      const rows = table.getFilteredRowModel().rows
      if (rows.length === 0) {
        toast.error('Không có dữ liệu để xuất file!')
        return
      }

      const dataToExport = rows.map((row) => {
        const user = row.original as any
        return {
          'Họ và tên': user.name || '',
          'Tên đăng nhập': user.username || '',
          Email: user.email || 'Chưa cấu hình',
          'Số điện thoại': user.phone || 'Chưa cấu hình',
          'Vai trò':
            user.role === 'ADMIN'
              ? 'Quản trị viên'
              : user.role === 'DEVICE'
                ? 'Thiết bị'
                : 'Thành viên',
          'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN'),
        }
      })

      // Chuyển JSON thành Sheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách')

      // Cấu hình chiều rộng cột tự động
      const maxLengths = Object.keys(dataToExport[0] || {}).map((key) => {
        return Math.max(
          key.length + 4,
          ...dataToExport.map((row: any) => String(row[key] || '').length + 2),
        )
      })
      worksheet['!cols'] = maxLengths.map((w) => ({ wch: w }))

      // Ghi và tải file về máy
      XLSX.writeFile(workbook, 'Danh_sach_nguoi_dung.xlsx')
      toast.success(`Đã xuất thành công ${rows.length} người dùng ra file Excel!`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất file Excel!')
      console.error(error)
    }
  }

  return (
    <div className='flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm theo họ tên...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[160px] text-xs lg:w-[260px]'
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title='Vai trò'
            options={roles}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => table.resetColumnFilters()}
            className='flex h-8 items-center gap-1 px-2 text-xs text-muted-foreground lg:px-3'
          >
            <span>Đặt lại bộ lọc</span>
            <X className='size-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleExportExcel}
          className='flex h-8 items-center gap-1.5 border-emerald-600/30 text-xs text-emerald-600 hover:border-emerald-600/60 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
        >
          <FileDown className='size-4' />
          <span>Xuất Excel</span>
        </Button>
        <DataTableViewOptions table={table} />
        <Button
          size='sm'
          onClick={() => table.options.meta?.onAddRow?.()}
          className='flex h-8 items-center gap-1.5 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/95'
        >
          <UserPlus className='size-4' />
          <span>Thêm người dùng</span>
        </Button>
      </div>
    </div>
  )
}
