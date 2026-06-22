'use client'

import { deleteRecipeAction } from '@/app/actions/recipe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChefHat, Clock, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { RecipeFormDialog, type RecipeWithIngredients } from './recipe-form-dialog'

interface RecipeTableProps {
  recipes: RecipeWithIngredients[]
}

export function RecipeTable({ recipes: initialRecipes }: RecipeTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEdit = (recipe: RecipeWithIngredients) => {
    setEditingRecipe(recipe)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingRecipe(null)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteRecipeAction(id)
      setDeletingId(null)
      if (result.success) {
        toast.success('Đã xóa công thức!')
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Công thức nấu ăn</h2>
          <p className='text-sm text-muted-foreground'>{initialRecipes.length} công thức</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className='mr-2 h-4 w-4' />
          Thêm công thức
        </Button>
      </div>

      {initialRecipes.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground'>
          <ChefHat className='h-12 w-12 opacity-30' />
          <p className='text-base'>Chưa có công thức nào</p>
          <Button variant='outline' onClick={handleAdd}>
            <Plus className='mr-2 h-4 w-4' />
            Tạo công thức đầu tiên
          </Button>
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên món</TableHead>
                <TableHead>Nguyên liệu</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className='w-[80px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-medium'>{recipe.name}</span>
                      {recipe.description && (
                        <span className='line-clamp-1 text-muted-foreground'>
                          {recipe.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {recipe.ingredients.slice(0, 3).map((ing) => (
                        <Badge key={ing.id} variant='secondary' className='text-xs'>
                          {ing.ingredient.name}
                        </Badge>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <Badge variant='outline' className='text-xs'>
                          +{recipe.ingredients.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.prepTime || recipe.cookTime ? (
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Clock className='h-3.5 w-3.5' />
                        {(recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)} phút
                      </div>
                    ) : (
                      <span className='text-sm text-muted-foreground'>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          {deletingId === recipe.id && isPending ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <MoreHorizontal className='h-4 w-4' />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleEdit(recipe)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(recipe.id)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RecipeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} recipe={editingRecipe} />
    </div>
  )
}
