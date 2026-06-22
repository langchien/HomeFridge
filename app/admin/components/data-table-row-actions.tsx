'use client'

import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash2, ShieldAlert } from 'lucide-react'
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

import { userSchema } from '../data/schema'
import { deleteUserAction } from '@/app/actions/users'

import { type Table } from '@tanstack/react-table'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table?: Table<TData>
}

export function DataTableRowActions<TData>({ row, table }: DataTableRowActionsProps<TData>) {
  const user = userSchema.parse(row.original)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteUserAction(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa người dùng "${user.name}" thành công!`)
        setIsDeleteOpen(false)
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi hệ thống khi xóa người dùng!')
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
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={() => {
              const tableMeta = table?.options.meta
              tableMeta?.onEditRow?.(user as any)
            }}
          >
            <Edit className='size-4 text-muted-foreground' />
            <span>Chỉnh sửa</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const tableMeta = table?.options.meta
              tableMeta?.onResetPassword?.(user as any)
            }}
          >
            <ShieldAlert className='size-4 text-muted-foreground' />
            <span>Đặt lại mật khẩu</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className='size-4' />
            <span>Xóa tài khoản</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xóa người dùng */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-semibold text-destructive'>
              <Trash2 className='size-5' />
              <span>Xác nhận xóa tài khoản?</span>
            </DialogTitle>
            <DialogDescription className='pt-2 text-sm text-muted-foreground'>
              Hành động này không thể hoàn tác. Tài khoản của <strong>{user.name}</strong> (
              <strong>@{user.username}</strong>) sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4 gap-2 sm:gap-0'>
            <Button variant='outline' disabled={isPending} onClick={() => setIsDeleteOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant='destructive' disabled={isPending} onClick={handleDelete}>
              {isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
