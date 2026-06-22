'use client'

import { useState } from 'react'
import { type Row, type Table } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { FridgeItemWithRelations } from './columns'
import { deleteFridgeItemAction } from '@/app/actions/fridge'

interface FridgeRowActionsProps<TData> {
  row: Row<TData>
  table?: Table<TData>
}

export function FridgeRowActions<TData>({ row, table }: FridgeRowActionsProps<TData>) {
  const item = row.original as FridgeItemWithRelations
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteFridgeItemAction(item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa thực phẩm "${item.name}" khỏi tủ lạnh thành công!`)
        setIsDeleteOpen(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi hệ thống khi xóa thực phẩm!')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-8 data-[state=open]:bg-muted'>
            <MoreHorizontal className='size-4' />
            <span className='sr-only'>Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              const tableMeta = table?.options.meta
              tableMeta?.onEditRow?.(item as any)
            }}
          >
            <Edit className='mr-2 size-4 text-muted-foreground' />
            <span>Chỉnh sửa</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            onClick={() => setIsDeleteOpen(true)}
            className='text-destructive focus:bg-destructive/10'
          >
            <Trash2 className='mr-2 size-4' />
            <span>Xóa thực phẩm</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa thực phẩm */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-destructive'>
              <Trash2 className='size-5' />
              <span>Xác nhận xóa thực phẩm?</span>
            </DialogTitle>
            <DialogDescription className='pt-2 text-sm text-muted-foreground'>
              Hành động này không thể hoàn tác. Thực phẩm <strong>{item.name}</strong> sẽ bị xóa
              vĩnh viễn khỏi tủ lạnh của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              disabled={isPending}
              onClick={() => setIsDeleteOpen(false)}
              className='h-9 text-xs'
            >
              Hủy bỏ
            </Button>
            <Button
              variant='destructive'
              disabled={isPending}
              onClick={handleDelete}
              className='h-9 text-xs'
            >
              {isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
