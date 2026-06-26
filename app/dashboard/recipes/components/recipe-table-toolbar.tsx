'use client'

import { type Table } from '@tanstack/react-table'
import { FileDown, X } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RecipeTableToolbarProps<TData> {
  table: Table<TData>
}

export function RecipeTableToolbar<TData>({ table }: RecipeTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleExportExcel = () => {
    try {
      const rows = table.getFilteredRowModel().rows
      if (rows.length === 0) {
        toast.error('Không có dữ liệu để xuất file!')
        return
      }

      const dataToExport = rows.map((row) => {
        const recipe = row.original as any
        return {
          'Tên công thức': recipe.title || '',
          'Mô tả': recipe.description || '',
          'Thời gian chuẩn bị (phút)': recipe.prepTime || '',
          'Thời gian nấu (phút)': recipe.cookTime || '',
          'Độ khó':
            recipe.difficulty === 'EASY'
              ? 'Dễ'
              : recipe.difficulty === 'MEDIUM'
                ? 'Trung bình'
                : recipe.difficulty === 'HARD'
                  ? 'Khó'
                  : recipe.difficulty || '',
          'Ngày tạo': new Date(recipe.createdAt).toLocaleDateString('vi-VN'),
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách')

      const maxLengths = Object.keys(dataToExport[0] || {}).map((key) => {
        return Math.max(
          key.length + 4,
          ...dataToExport.map((row: any) => String(row[key] || '').length + 2),
        )
      })
      worksheet['!cols'] = maxLengths.map((w) => ({ wch: w }))

      XLSX.writeFile(workbook, 'Danh_sach_cong_thuc.xlsx')
      toast.success(`Đã xuất thành công ${rows.length} công thức ra file Excel!`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất file Excel!')
      console.error(error)
    }
  }

  return (
    <div className='flex flex-col gap-3 pb-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên công thức...'
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            className='h-8 w-[200px] lg:w-[280px]'
          />
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => table.resetColumnFilters()}
              className='flex h-8 items-center gap-1 px-2 text-muted-foreground lg:px-3'
            >
              <span>Đặt lại</span>
              <X className='size-4' />
            </Button>
          )}
        </div>
        <div className='flex items-center justify-end gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportExcel}
            className='flex h-8 items-center gap-1.5 border-emerald-600/30 text-emerald-600 hover:border-emerald-600/60 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
          >
            <FileDown className='size-4' />
            <span>Xuất Excel</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
