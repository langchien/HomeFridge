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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    <div className='fixed bottom-6 right-6 flex flex-col gap-3 z-50'>
      <TooltipProvider delayDuration={100}>
        {/* Nút Lên Menu */}
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button size='icon' className='h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all'>
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
              className='h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer'
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
