'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Ingredient } from '@/generated/prisma/client'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeFormDialog } from './recipe-form-dialog'

interface FloatingActionButtonsProps {
  ingredients: Ingredient[]
}

export function FloatingActionButtons({ ingredients }: FloatingActionButtonsProps) {
  const router = useRouter()
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      {/* FAB: Thêm công thức mới */}
      <div className='fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id='btn-add-recipe'
              size='lg'
              onClick={() => setIsAddOpen(true)}
              className='h-14 w-14 rounded-full bg-amber-600 shadow-lg transition-all hover:scale-105 hover:bg-amber-700 hover:shadow-xl'
            >
              <Plus className='size-6' />
              <span className='sr-only'>Thêm công thức mới</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Thêm công thức mới</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Dialog thêm công thức */}
      <RecipeFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        recipe={null}
        ingredients={ingredients}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
