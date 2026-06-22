'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Category } from '@/generated/prisma/client'
import { IngredientFormDialog } from './ingredient-form-dialog'
import { CategoryFormDialog } from './category-form-dialog'

interface FloatingActionButtonsProps {
  categories: Category[]
}

export function FloatingActionButtons({ categories }: FloatingActionButtonsProps) {
  const router = useRouter()
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

  const [prevCategories, setPrevCategories] = useState<Category[]>(categories)
  const [categoriesState, setCategoriesState] = useState<Category[]>(categories)

  if (categories !== prevCategories) {
    setPrevCategories(categories)
    setCategoriesState(categories)
  }

  const handleCategorySuccess = () => {
    router.refresh()
  }

  const handleIngredientSuccess = () => {
    router.refresh()
  }

  return (
    <div className='fixed right-6 bottom-6 z-50 flex flex-col items-center gap-3'>
      <TooltipProvider delayDuration={100}>
        {/* Nút Thêm Danh Mục (Hiển thị phía trên) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              className='h-12 w-12 cursor-pointer rounded-full bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg'
              onClick={() => setIsAddCategoryOpen(true)}
            >
              <FolderPlus className='h-5 w-5' />
              <span className='sr-only'>Thêm danh mục</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Thêm danh mục mới</p>
          </TooltipContent>
        </Tooltip>

        {/* Nút Thêm Nguyên Liệu (Hiển thị phía dưới) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              className='h-14 w-14 cursor-pointer rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl'
              onClick={() => setIsAddIngredientOpen(true)}
            >
              <Plus className='h-6 w-6' />
              <span className='sr-only'>Thêm nguyên liệu</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Thêm nguyên liệu mới</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dialog Form Thêm Danh Mục */}
      <CategoryFormDialog
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onSuccess={handleCategorySuccess}
      />

      {/* Dialog Form Thêm Nguyên Liệu */}
      <IngredientFormDialog
        open={isAddIngredientOpen}
        onOpenChange={setIsAddIngredientOpen}
        item={null}
        categories={categoriesState}
        onSuccess={handleIngredientSuccess}
      />
    </div>
  )
}
