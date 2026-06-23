'use client'

import type { ShoppingListWithItems } from '@/app/actions/shopping'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react'

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

interface WeeklyShoppingBoardProps {
  weekStart: Date
  shoppingLists: ShoppingListWithItems[]
  selectedDateStr: string | null
  onWeekChange: (newWeekStart: Date) => void
  onSelectDate: (dateStr: string) => void
}

// ─── Component ────────────────────────────────────────────────

export function WeeklyShoppingBoard({
  weekStart,
  shoppingLists,
  selectedDateStr,
  onWeekChange,
  onSelectDate,
}: WeeklyShoppingBoardProps) {
  const weekDays = getWeekDays(weekStart)

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

  const getListForDate = (date: Date): ShoppingListWithItems | undefined => {
    const dateStr = isoDate(date)
    return shoppingLists.find((l) => isoDate(new Date(l.date)) === dateStr)
  }

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
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>
            Tuần {weekStartFormatted} — {weekEndFormatted}
          </h2>
          <p className='text-sm text-muted-foreground'>
            Chọn một ngày để quản lý danh sách mua sắm
          </p>
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
        </div>
      </div>

      {/* Lịch tuần ngang */}
      <div className='overflow-x-auto rounded-xl border bg-card shadow-sm'>
        <div className='min-w-[700px]'>
          <div className='grid grid-cols-7 border-b bg-muted/30'>
            {weekDays.map((date, i) => {
              const today = isToday(date)
              const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 border-r p-3 text-center last:border-r-0',
                    today && 'bg-teal-50/60 dark:bg-teal-950/20',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium tracking-wide text-muted-foreground uppercase',
                      today && 'text-teal-600 dark:text-teal-400',
                    )}
                  >
                    {DAY_NAMES[i]}
                  </span>
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                      today ? 'bg-teal-600 text-white shadow-sm' : 'text-foreground',
                    )}
                  >
                    {date.getUTCDate()}
                  </span>
                </div>
              )
            })}
          </div>

          <div className='grid grid-cols-7'>
            {weekDays.map((date, i) => {
              const list = getListForDate(date)
              const dateStr = isoDate(date)
              const isSelected = selectedDateStr === dateStr
              const today = isToday(date)

              return (
                <div
                  key={i}
                  className={cn(
                    'group relative flex min-h-[120px] cursor-pointer flex-col gap-2 border-r p-3 transition-colors last:border-r-0',
                    today && 'bg-teal-50/30 dark:bg-teal-950/10',
                    isSelected && 'bg-teal-50 ring-2 ring-teal-500 ring-inset dark:bg-teal-900/30',
                    !isSelected && 'hover:bg-muted/40',
                  )}
                  onClick={() => onSelectDate(dateStr)}
                >
                  {list ? (
                    <div className='flex flex-col gap-1 rounded-lg border bg-background p-2 shadow-sm'>
                      <div className='flex items-center gap-2 text-teal-600 dark:text-teal-400'>
                        <ShoppingCart className='size-4' />
                        <span className='text-xs font-semibold'>Đã có DS</span>
                      </div>
                      <p className='text-[10px] text-muted-foreground'>
                        {list.items.length} món đồ
                      </p>
                      <p className='text-[10px] text-muted-foreground'>
                        {list.items.filter((i) => i.isBought).length} đã mua
                      </p>
                    </div>
                  ) : (
                    <div className='flex h-full w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100'>
                      <div className='flex flex-col items-center gap-1'>
                        <Plus className='size-4' />
                        <span className='text-[10px] font-medium'>Thêm DS</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
