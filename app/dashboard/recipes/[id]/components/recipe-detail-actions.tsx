'use client'

import { deleteRecipeAction } from '@/app/actions/recipe'
import { Button } from '@/components/ui/button'
import type { Ingredient, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { RecipeFormDialog } from '../../components/recipe-form-dialog'
import type { RecipeWithRelations } from '../../components/columns'

interface RecipeDetailActionsProps {
  recipe: RecipeWithRelations
}

export function RecipeDetailActions({ recipe }: RecipeDetailActionsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa công thức "${recipe.title}"?\nHành động này không thể hoàn tác.`,
      )
    )
      return

    setIsDeleting(true)
    try {
      const result = await deleteRecipeAction(recipe.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa công thức "${recipe.title}"!`)
        router.push('/dashboard/recipes')
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi xóa công thức!')
    } finally {
      setIsDeleting(false)
    }
  }

  // Cần fetch lại ingredients để truyền vào form
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isFetchingIng, setIsFetchingIng] = useState(false)

  const handleOpenEdit = async () => {
    if (ingredients.length === 0 && !isFetchingIng) {
      setIsFetchingIng(true)
      try {
        const res = await fetch('/api/ingredients')
        const data = await res.json()
        setIngredients(data || [])
      } catch {
        // nếu lỗi vẫn mở dialog với rỗng
      } finally {
        setIsFetchingIng(false)
      }
    }
    setIsEditOpen(true)
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleOpenEdit}
          disabled={isFetchingIng}
          className='gap-2'
        >
          <Pencil className='size-4' />
          Sửa công thức
        </Button>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleDelete}
          disabled={isDeleting}
          className='gap-2'
        >
          <Trash2 className='size-4' />
          {isDeleting ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </div>

      <RecipeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        recipe={recipe}
        ingredients={ingredients}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
