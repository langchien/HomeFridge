'use client'

import { deleteRecipeAction } from '@/app/actions/recipe'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Row, Table } from '@tanstack/react-table'
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RecipeWithRelations } from './columns'

interface RecipeRowActionsProps {
  row: Row<RecipeWithRelations>
  table: Table<RecipeWithRelations>
}

export function RecipeRowActions({ row, table }: RecipeRowActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const recipe = row.original

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa công thức "${recipe.title}"?`)) return

    setIsDeleting(true)
    try {
      const result = await deleteRecipeAction(recipe.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa công thức "${recipe.title}" thành công!`)
        router.refresh()
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xóa công thức!')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    const meta = table.options.meta as { onEditRow?: (item: RecipeWithRelations) => void }
    if (meta?.onEditRow) {
      meta.onEditRow(recipe)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/recipes/${recipe.id}`} className='flex items-center gap-2'>
            <ExternalLink className='size-4' />
            Xem chi tiết
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit} className='flex items-center gap-2'>
          <Pencil className='size-4' />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className='flex items-center gap-2 text-destructive focus:text-destructive'
        >
          <Trash2 className='size-4' />
          {isDeleting ? 'Đang xóa...' : 'Xóa công thức'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
