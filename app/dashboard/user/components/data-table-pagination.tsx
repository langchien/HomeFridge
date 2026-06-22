import { type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className='flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='order-2 text-muted-foreground sm:order-1'>
        Đã chọn {table.getFilteredSelectedRowModel().rows.length} trong tổng số{' '}
        {table.getFilteredRowModel().rows.length} dòng.
      </div>
      <div className='order-1 flex flex-wrap items-center justify-end gap-4 sm:order-2 sm:gap-6 lg:gap-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Số dòng mỗi trang</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center font-medium'>
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Trang đầu</span>
            <ChevronsLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Trang trước</span>
            <ChevronLeft className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Trang sau</span>
            <ChevronRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Trang cuối</span>
            <ChevronsRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
