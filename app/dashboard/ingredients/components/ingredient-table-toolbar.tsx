'use client'

import { type Table } from '@tanstack/react-table'
import { FileDown, Trash2, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { DataTableFacetedFilter } from '@/app/dashboard/user/components/data-table-faceted-filter'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { deleteIngredientsAction } from '@/app/actions/ingredient'
import type { Category } from '@/generated/prisma/client'
import { IngredientTableViewOptions } from './ingredient-table-view-options'

interface IngredientTableToolbarProps<TData> {
  table: Table<TData>
  categories: Category[]
}

export function IngredientTableToolbar<TData>({
  table,
  categories,
}: IngredientTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelected = selectedRows.length > 0

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleBulkDelete = () => {
    startTransition(async () => {
      try {
        const ids = selectedRows.map((row) => (row.original as any).id)
        const result = await deleteIngredientsAction(ids)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(`Đã xóa thành công ${ids.length} nguyên liệu!`)
          setIsDeleteDialogOpen(false)
          table.toggleAllRowsSelected(false)
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa nguyên liệu!')
        console.error(error)
      }
    })
  }

  const handleExportExcel = () => {
    try {
      const rows = table.getFilteredRowModel().rows
      if (rows.length === 0) {
        toast.error('Không có dữ liệu để xuất file!')
        return
      }

      const dataToExport = rows.map((row) => {
        const ingredient = row.original as any
        return {
          'Tên nguyên liệu': ingredient.name || '',
          'Danh mục': ingredient.category?.name || '',
          'Đơn vị đo mặc định': ingredient.defaultUnit || '',
          'Lượng calo': ingredient.calories || '',
          'Ngày tạo': new Date(ingredient.createdAt).toLocaleDateString('vi-VN'),
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

      XLSX.writeFile(workbook, 'Danh_sach_nguyen_lieu.xlsx')
      toast.success(`Đã xuất thành công ${rows.length} nguyên liệu ra file Excel!`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất file Excel!')
      console.error(error)
    }
  }

  const categoryOptions = categories.map((cat) => ({
    label: `${cat.icon || '📦'} ${cat.name}`,
    value: cat.id,
  }))

  return (
    <div className='flex flex-col gap-3 pb-4'>
      {/* Search + Filters */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên nguyên liệu...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='h-8 w-[160px] lg:w-[240px]'
          />
          {/* Filter Category */}
          {table.getColumn('category') && categoryOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('category')}
              title='Danh mục'
              options={categoryOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                table.resetColumnFilters()
              }}
              className='flex h-8 items-center gap-1 px-2 text-muted-foreground lg:px-3'
            >
              <span>Đặt lại</span>
              <X className='size-4' />
            </Button>
          )}
        </div>
        <div className='flex items-center justify-end gap-2'>
          {hasSelected && (
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='flex h-8 items-center gap-1.5'
            >
              <Trash2 className='size-4' />
              <span>Xóa ({selectedRows.length})</span>
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={handleExportExcel}
            className='flex h-8 items-center gap-1.5 border-emerald-600/30 text-emerald-600 hover:border-emerald-600/60 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
          >
            <FileDown className='size-4' />
            <span>Xuất Excel</span>
          </Button>
          <IngredientTableViewOptions table={table} />
        </div>
      </div>

      {/* Dialog xác nhận xóa nhiều */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-destructive'>
              <Trash2 className='size-5' />
              <span>Xác nhận xóa nguyên liệu?</span>
            </DialogTitle>
            <DialogDescription className='pt-2 text-muted-foreground'>
              Hành động này không thể hoàn tác. Bạn đang chuẩn bị xóa <strong>{selectedRows.length}</strong> nguyên liệu vĩnh viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              disabled={isPending}
              onClick={() => setIsDeleteDialogOpen(false)}
              className='h-9'
            >
              Hủy bỏ
            </Button>
            <Button
              variant='destructive'
              disabled={isPending}
              onClick={handleBulkDelete}
              className='h-9'
            >
              {isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
