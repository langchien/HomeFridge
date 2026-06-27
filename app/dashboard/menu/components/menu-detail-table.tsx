'use client'

import type { MenuPlanWithRelations } from '@/app/actions/menu'
import { deleteMenuPlanAction, updateMenuStatusAction } from '@/app/actions/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MenuStatus } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MEAL_TIME_LABELS } from './add-menu-dialog'
import { checkRecipeIngredientsAction } from '@/app/actions/menu'

// ─── Status config ────────────────────────────────────────────

const STATUS_CONFIG: Record<MenuStatus, { label: string; classes: string }> = {
  PLANNED: {
    label: 'Kế hoạch',
    classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  },
  COOKING: {
    label: 'Đang nấu',
    classes:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  },
  DONE: {
    label: 'Hoàn thành',
    classes:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Đã hủy',
    classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  },
}

const STATUS_OPTIONS: { value: MenuStatus; label: string }[] = [
  { value: 'PLANNED', label: '📋 Kế hoạch' },
  { value: 'COOKING', label: '🍳 Đang nấu' },
  { value: 'DONE', label: '✅ Hoàn thành' },
  { value: 'CANCELLED', label: '❌ Đã hủy' },
]

// ─── Props ────────────────────────────────────────────────────

interface MenuDetailTableProps {
  menuPlans: MenuPlanWithRelations[]
  onDataChange: () => void
}

// ─── Component ────────────────────────────────────────────────

export function MenuDetailTable({ menuPlans, onDataChange }: MenuDetailTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  // State for DONE confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    planId: string;
    recipeTitle: string;
    loading: boolean;
    missingItems?: string[];
  }>({
    isOpen: false,
    planId: '',
    recipeTitle: '',
    loading: false,
  })

  const handleStatusChange = async (id: string, recipeId: string, recipeTitle: string, status: MenuStatus) => {
    // Nếu trạng thái là DONE, hiển thị Dialog xác nhận trước khi thực hiện
    if (status === 'DONE') {
      setLoadingId(id)
      try {
        const checkResult = await checkRecipeIngredientsAction(recipeId)
        if (checkResult.error) {
          toast.error(checkResult.error)
          return
        }
        setConfirmDialog({
          isOpen: true,
          planId: id,
          recipeTitle,
          loading: false,
          missingItems: checkResult.missingItems,
        })
      } catch (error) {
        toast.error('Lỗi khi kiểm tra nguyên liệu.')
      } finally {
        setLoadingId(null)
      }
      return
    }

    // Các trạng thái khác cập nhật trực tiếp
    setLoadingId(id)
    try {
      const result = await updateMenuStatusAction(id, status)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Đã cập nhật trạng thái!')
        onDataChange()
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleConfirmDone = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }))
    try {
      const result = await updateMenuStatusAction(confirmDialog.planId, 'DONE')
      if (result.error) {
        toast.error(result.error)
      } else {
        if (result.deductWarning) {
          // Vẫn thành công nhưng có nguyên liệu không đủ
          toast.success('✅ Đã hoàn thành!')
          toast.warning(`⚠️ ${result.deductWarning}`, { duration: 6000 })
          if (result.deductedItems && result.deductedItems.length > 0) {
            toast.info(`🛒 Đã trừ: ${result.deductedItems.join(', ')}`, { duration: 6000 })
          }
        } else {
          if (result.deductedItems && result.deductedItems.length > 0) {
            toast.success(`✅ Hoàn thành! Đã trừ: ${result.deductedItems.join(', ')}`, {
              duration: 5000,
            })
          } else {
            toast.success('✅ Hoàn thành! Món này không yêu cầu trừ nguyên liệu.')
          }
        }
        onDataChange()
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái.')
    } finally {
      setConfirmDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleDelete = async (id: string, title: string) => {
    setLoadingId(id)
    try {
      const result = await deleteMenuPlanAction(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Đã xóa "${title}" khỏi thực đơn.`)
        onDataChange()
      }
    } catch {
      toast.error('Lỗi khi xóa món ăn.')
    } finally {
      setLoadingId(null)
    }
  }

  if (menuPlans.length === 0) {
    return (
      <div className='rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-sm'>
        <p className='text-lg font-medium'>Tuần này chưa có thực đơn nào.</p>
        <p className='mt-1 text-sm'>Hãy click vào ô trên lịch để thêm món ăn!</p>
      </div>
    )
  }

  return (
    <>
      <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30 hover:bg-muted/30'>
            <TableHead className='w-[180px] font-semibold'>Ngày</TableHead>
            <TableHead className='w-[120px] font-semibold'>Bữa ăn</TableHead>
            <TableHead className='font-semibold'>Món ăn</TableHead>
            <TableHead className='w-[160px] font-semibold'>Trạng thái</TableHead>
            <TableHead className='w-[80px] text-right font-semibold'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuPlans.map((plan) => {
            const isLoading = loadingId === plan.id
            const dateFormatted = new Date(plan.date).toLocaleDateString('vi-VN', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              timeZone: 'UTC',
            })

            return (
              <TableRow
                key={plan.id}
                className={cn(
                  'transition-colors',
                  plan.status === 'DONE' && 'opacity-60',
                  isLoading && 'pointer-events-none opacity-50',
                )}
              >
                {/* Ngày */}
                <TableCell className='font-medium'>{dateFormatted}</TableCell>

                {/* Bữa */}
                <TableCell>
                  <span className='text-sm'>{MEAL_TIME_LABELS[plan.mealTime]}</span>
                </TableCell>

                {/* Món ăn */}
                <TableCell>
                  <div className='flex items-center gap-3'>
                    {plan.recipe.thumbnail && (
                      <div className='relative size-10 shrink-0 overflow-hidden rounded-md border'>
                        <Image
                          src={plan.recipe.thumbnail}
                          alt={plan.recipe.title}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}
                    <div className='flex flex-col gap-0.5'>
                      <Link 
                        href={`/dashboard/recipes/${plan.recipe.id}`}
                        className='font-medium hover:underline hover:text-teal-600 transition-colors'
                      >
                        {plan.recipe.title}
                      </Link>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        {plan.recipe.cookTime && <span>⏱ {plan.recipe.cookTime} phút</span>}
                        {plan.recipe.servings && <span>👥 {plan.recipe.servings} người</span>}
                        {plan.note && (
                          <span className='text-muted-foreground/70 italic'>📝 {plan.note}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Trạng thái */}
                <TableCell>
                  <Select
                    value={plan.status}
                    onValueChange={(v) => handleStatusChange(plan.id, plan.recipe.id, plan.recipe.title, v as MenuStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className='h-8 w-full border-none p-0 shadow-none focus:ring-0'>
                      <SelectValue>
                        <Badge
                          variant='outline'
                          className={cn('font-semibold', STATUS_CONFIG[plan.status].classes)}
                        >
                          {STATUS_CONFIG[plan.status].label}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Thao tác */}
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 text-muted-foreground hover:text-destructive'
                    onClick={() => handleDelete(plan.id, plan.recipe.title)}
                    disabled={isLoading}
                    title='Xóa khỏi thực đơn'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>

      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => !confirmDialog.loading && setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn thành món ăn</DialogTitle>
            <DialogDescription>
              Bạn sắp đánh dấu món <strong>{confirmDialog.recipeTitle}</strong> là Hoàn thành. Hệ thống sẽ tự động trừ các nguyên liệu của món ăn này trong Tủ lạnh.
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.missingItems && confirmDialog.missingItems.length > 0 ? (
            <div className='rounded-md bg-amber-50 p-4 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/50'>
              <div className='flex'>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                    Lưu ý: Tủ lạnh đang thiếu một số nguyên liệu:
                  </h3>
                  <div className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
                    <ul className='list-disc pl-5 space-y-1'>
                      {confirmDialog.missingItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <p className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
                    Hệ thống sẽ chỉ trừ những nguyên liệu còn đủ. Bạn có chắc chắn muốn tiếp tục?
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-md bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900/50'>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>
                ✅ Tủ lạnh hiện có đủ tất cả nguyên liệu cho món ăn này.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              disabled={confirmDialog.loading}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmDone}
              disabled={confirmDialog.loading}
              className='bg-teal-600 hover:bg-teal-700 text-white'
            >
              {confirmDialog.loading ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
