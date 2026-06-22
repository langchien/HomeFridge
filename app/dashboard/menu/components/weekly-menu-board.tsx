'use client'

import { deleteMenuPlanAction } from '@/app/actions/menu'
import type { MenuPlanWithRelations } from '@/app/actions/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MealTime, MenuStatus } from '@/generated/prisma/client'
import type { Recipe } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { AddMenuDialog, MEAL_TIME_LABELS } from './add-menu-dialog'

// ─── Constants ────────────────────────────────────────────────

const MEAL_TIMES: MealTime[] = ['BREAKFAST', 'LUNCH', 'DINNER']

const STATUS_CONFIG: Record<
  MenuStatus,
  { label: string; classes: string }
> = {
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

// ─── Helpers ──────────────────────────────────────────────────

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setUTCDate(d.getUTCDate() + i)
    return d
  })
}

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getUTCFullYear() === today.getFullYear() &&
    date.getUTCMonth() === today.getMonth() &&
    date.getUTCDate() === today.getDate()
  )
}

// ─── Props ────────────────────────────────────────────────────

interface WeeklyMenuBoardProps {
  weekStart: Date
  menuPlans: MenuPlanWithRelations[]
  recipes: Recipe[]
  onWeekChange: (newWeekStart: Date) => void
  onDataChange: () => void
  onOpenAutoGen: () => void
}

// ─── Component ────────────────────────────────────────────────

export function WeeklyMenuBoard({
  weekStart,
  menuPlans,
  recipes,
  onWeekChange,
  onDataChange,
  onOpenAutoGen,
}: WeeklyMenuBoardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime | null>(null)

  // State loading cho xóa
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const weekDays = getWeekDays(weekStart)

  // Điều hướng tuần
  const goToPrevWeek = () => {
    const prev = new Date(weekStart)
    prev.setUTCDate(prev.getUTCDate() - 7)
    onWeekChange(prev)
  }

  const goToNextWeek = () => {
    const next = new Date(weekStart)
    next.setUTCDate(next.getUTCDate() + 7)
    onWeekChange(next)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const day = today.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setUTCDate(today.getUTCDate() + diff)
    monday.setUTCHours(0, 0, 0, 0)
    onWeekChange(monday)
  }

  // Lấy plans cho ô ngày + bữa cụ thể
  const getPlansForCell = (date: Date, mealTime: MealTime): MenuPlanWithRelations[] => {
    const dateStr = isoDate(date)
    return menuPlans.filter((p) => isoDate(new Date(p.date)) === dateStr && p.mealTime === mealTime)
  }

  // Mở dialog thêm món
  const openAddDialog = (date: Date, mealTime: MealTime) => {
    setSelectedDate(date.toISOString())
    setSelectedMealTime(mealTime)
    setAddDialogOpen(true)
  }

  // Xóa món
  const handleDelete = async (id: string, title: string) => {
    setDeletingId(id)
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
      setDeletingId(null)
    }
  }

  // Tiêu đề tuần
  const weekStartFormatted = weekStart.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
  const weekEndFormatted = weekEnd.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className='flex flex-col gap-4'>
      {/* Điều hướng tuần */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-semibold'>
            Tuần {weekStartFormatted} — {weekEndFormatted}
          </h2>
          <p className='text-sm text-muted-foreground'>Lên thực đơn theo ngày và bữa ăn</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' onClick={goToPrevWeek} title='Tuần trước'>
            <ChevronLeft className='size-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={goToCurrentWeek}>
            Tuần này
          </Button>
          <Button variant='outline' size='icon' onClick={goToNextWeek} title='Tuần sau'>
            <ChevronRight className='size-4' />
          </Button>
          <Button
            variant='default'
            className='ml-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
            size='sm'
            onClick={onOpenAutoGen}
          >
            <Sparkles className='mr-2 size-4' />
            Gợi ý thực đơn
          </Button>
        </div>
      </div>

      {/* Lịch tuần — overflow scroll ngang trên mobile */}
      <div className='overflow-x-auto rounded-xl border bg-card shadow-sm'>
        <div className='min-w-[700px]'>
          {/* Header hàng ngày */}
          <div className='grid grid-cols-8 border-b bg-muted/30'>
            {/* Cột bữa ăn */}
            <div className='flex items-center justify-center p-3 text-sm font-semibold text-muted-foreground'>
              Bữa
            </div>
            {weekDays.map((date, i) => {
              const today = isToday(date)
              const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 p-3 text-center',
                    today && 'bg-teal-50/60 dark:bg-teal-950/20',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wide text-muted-foreground',
                      today && 'text-teal-600 dark:text-teal-400',
                    )}
                  >
                    {DAY_NAMES[i]}
                  </span>
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                      today
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-foreground',
                    )}
                  >
                    {date.getUTCDate()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Hàng từng bữa */}
          {MEAL_TIMES.map((mealTime) => (
            <div
              key={mealTime}
              className='grid grid-cols-8 border-b last:border-b-0'
            >
              {/* Label bữa */}
              <div className='flex flex-col items-center justify-center gap-0.5 border-r bg-muted/20 p-3 text-center'>
                <span className='text-lg'>
                  {mealTime === 'BREAKFAST' ? '🌅' : mealTime === 'LUNCH' ? '☀️' : '🌙'}
                </span>
                <span className='text-xs font-semibold text-muted-foreground'>
                  {mealTime === 'BREAKFAST' ? 'Sáng' : mealTime === 'LUNCH' ? 'Trưa' : 'Tối'}
                </span>
              </div>

              {/* Ô từng ngày */}
              {weekDays.map((date, dayIdx) => {
                const plans = getPlansForCell(date, mealTime)
                const today = isToday(date)

                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      'group relative flex min-h-[100px] flex-col gap-1.5 border-r p-2 last:border-r-0 transition-colors',
                      today && 'bg-teal-50/30 dark:bg-teal-950/10',
                      plans.length === 0 &&
                        'cursor-pointer hover:bg-muted/40',
                    )}
                    onClick={() => {
                      if (plans.length === 0) openAddDialog(date, mealTime)
                    }}
                    title={plans.length === 0 ? 'Click để thêm món' : undefined}
                  >
                    {/* Các món đã thêm */}
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className='group/card relative flex flex-col gap-1 overflow-hidden rounded-lg border bg-background p-1.5 shadow-sm transition-shadow hover:shadow-md'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Thumbnail nhỏ */}
                        {plan.recipe.thumbnail && (
                          <div className='relative h-10 w-full overflow-hidden rounded-md'>
                            <Image
                              src={plan.recipe.thumbnail}
                              alt={plan.recipe.title}
                              fill
                              className='object-cover'
                            />
                          </div>
                        )}

                        {/* Tên món */}
                        <p className='line-clamp-2 text-xs font-medium leading-tight'>
                          {plan.recipe.title}
                        </p>

                        {/* Badge status */}
                        <Badge
                          variant='outline'
                          className={cn(
                            'h-4 px-1 text-[10px] font-semibold',
                            STATUS_CONFIG[plan.status].classes,
                          )}
                        >
                          {STATUS_CONFIG[plan.status].label}
                        </Badge>

                        {/* Nút xóa */}
                        <button
                          onClick={() => handleDelete(plan.id, plan.recipe.title)}
                          disabled={deletingId === plan.id}
                          className='absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive/80 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive group-hover/card:opacity-100'
                          title='Xóa khỏi thực đơn'
                        >
                          <Trash2 className='size-2.5' />
                        </button>
                      </div>
                    ))}

                    {/* Nút thêm */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openAddDialog(date, mealTime)
                      }}
                      className={cn(
                        'flex w-full items-center justify-center gap-1 rounded-md border border-dashed py-1 text-xs text-muted-foreground transition-all hover:border-teal-400 hover:text-teal-600',
                        plans.length === 0
                          ? 'opacity-0 group-hover:opacity-100'
                          : 'mt-auto opacity-60 hover:opacity-100',
                      )}
                      title='Thêm món'
                    >
                      <Plus className='size-3' />
                      <span>Thêm</span>
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dialog thêm món */}
      <AddMenuDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        selectedDate={selectedDate}
        selectedMealTime={selectedMealTime}
        recipes={recipes}
        onSuccess={onDataChange}
      />
    </div>
  )
}
