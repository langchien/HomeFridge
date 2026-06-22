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
import { MEAL_TIME_LABELS } from './add-menu-dialog'

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

  const handleStatusChange = async (id: string, status: MenuStatus) => {
    // TODO: Tương lai - Tích hợp "Kế hoạch đi chợ"
    // Khi người dùng chọn trạng thái 'DONE':
    // 1. Dùng API kiểm tra (dry-run) xem nguyên liệu có đủ không.
    // 2. Nếu THIẾU nguyên liệu, KHÔNG CẬP NHẬT TRẠNG THÁI NGAY. Hãy mở một Dialog Alert.
    // 3. Dialog Alert sẽ cho người dùng 2 lựa chọn:
    //    - Lựa chọn 1: "Chấp nhận hoàn thành & Xóa nguyên liệu về 0" (Tiếp tục gọi API trừ).
    //    - Lựa chọn 2: "Từ chối hoàn thành & Thêm đồ còn thiếu vào Kế hoạch đi chợ".
    setLoadingId(id)
    try {
      const result = await updateMenuStatusAction(id, status)
      if (result.error) {
        toast.error(result.error)
      } else {
        if (status === 'DONE') {
          if (result.deductWarning) {
            // Vẫn thành công nhưng có nguyên liệu không đủ
            toast.success('✅ Đã hoàn thành!')
            toast.warning(`⚠️ ${result.deductWarning}`, { duration: 6000 })
            if (result.deductedItems && result.deductedItems.length > 0) {
              toast.info(`🛒 Đã trừ: ${result.deductedItems.join(', ')}`, { duration: 6000 })
            }
          } else {
            if (result.deductedItems && result.deductedItems.length > 0) {
              toast.success(`✅ Hoàn thành! Đã trừ: ${result.deductedItems.join(', ')}`, { duration: 5000 })
            } else {
              toast.success('✅ Hoàn thành! Món này không yêu cầu trừ nguyên liệu.')
            }
          }
        } else {
          toast.success('Đã cập nhật trạng thái!')
        }
        onDataChange()
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái.')
    } finally {
      setLoadingId(null)
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
                      <span className='font-medium'>{plan.recipe.title}</span>
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
                    onValueChange={(v) => handleStatusChange(plan.id, v as MenuStatus)}
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
  )
}
