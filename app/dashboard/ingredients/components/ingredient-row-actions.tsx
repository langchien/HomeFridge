'use client'

import { type Row, type Table } from '@tanstack/react-table'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { deleteIngredientAction } from '@/app/actions/ingredient'
import { IngredientWithRelations } from './columns'

interface IngredientRowActionsProps<TData> {
  row: Row<TData>
  table?: Table<TData>
}

export function IngredientRowActions<TData>({ row, table }: IngredientRowActionsProps<TData>) {
  const item = row.original as IngredientWithRelations
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteIngredientAction(item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa nguyên liệu "${item.name}" thành công!`)
        setIsDeleteOpen(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi hệ thống khi xóa nguyên liệu!')
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
            <span>Xóa nguyên liệu</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa nguyên liệu */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent size={'xl'}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-destructive'>
              <Trash2 className='size-5' />
              <span>Xác nhận xóa nguyên liệu?</span>
            </DialogTitle>
            <DialogDescription className='pt-2 text-muted-foreground'>
              Hành động này không thể hoàn tác. Nguyên liệu <strong>{item.name}</strong> sẽ bị xóa
              vĩnh viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button
              variant='outline'
              disabled={isPending}
              onClick={() => setIsDeleteOpen(false)}
              className='h-9'
            >
              Hủy bỏ
            </Button>
            <Button
              variant='destructive'
              disabled={isPending}
              onClick={handleDelete}
              className='h-9'
            >
              {isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
