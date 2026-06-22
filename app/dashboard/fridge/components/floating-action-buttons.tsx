'use client'

import { Plus, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Category, User } from '@/generated/prisma/client'
import { FridgeFormDialog } from './fridge-form-dialog'
import { useState, useEffect } from 'react'

interface FloatingActionButtonsProps {
  categories: Category[]
  users: User[]
}

export function FloatingActionButtons({ categories, users }: FloatingActionButtonsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [prevCategories, setPrevCategories] = useState<Category[]>(categories)
  const [categoriesState, setCategoriesState] = useState<Category[]>(categories)

  if (categories !== prevCategories) {
    setPrevCategories(categories)
    setCategoriesState(categories)
  }

  return (
    <div className='fixed right-6 bottom-6 z-50 flex flex-col gap-3'>
      <TooltipProvider delayDuration={100}>
        {/* Nút Lên Menu */}
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  size='icon'
                  className='h-14 w-14 rounded-full bg-primary shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl'
                >
                  <ListPlus className='h-6 w-6' />
                  <span className='sr-only'>Lên menu</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side='left'>
              <p>Lên menu mới</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lên thực đơn mới</DialogTitle>
              <DialogDescription>
                Tạo một thực đơn mới dựa trên các nguyên liệu có sẵn trong tủ lạnh.
              </DialogDescription>
            </DialogHeader>
            <div className='py-6 text-center text-muted-foreground'>
              Tính năng đang được phát triển...
            </div>
          </DialogContent>
        </Dialog>

        {/* Nút Thêm Thực Phẩm */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size='icon'
              className='h-14 w-14 cursor-pointer rounded-full bg-emerald-600 shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl'
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className='h-6 w-6 text-white' />
              <span className='sr-only'>Thêm thực phẩm</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <p>Thêm thực phẩm vào tủ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dialog Form Thêm Thực Phẩm */}
      <FridgeFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        item={null}
        categories={categoriesState}
        users={users}
        onSuccess={(updatedCats) => {
          if (updatedCats) {
            setCategoriesState(updatedCats)
          }
        }}
      />
    </div>
  )
}
