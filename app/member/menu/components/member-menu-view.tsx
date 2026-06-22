'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RequestDishDialog } from './request-dish-dialog'
import {
  Sun,
  Moon,
  CalendarDays,
  UtensilsCrossed,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from 'lucide-react'
import type {
  DailyMenu,
  DailyMenuItem,
  Recipe,
  RecipeIngredient,
  MenuRequest,
  User,
  MenuStatus,
} from '@/generated/prisma/client'

type MenuItemWithRecipe = DailyMenuItem & {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}
type DailyMenuWithItems = DailyMenu & { items: MenuItemWithRecipe[] }
type MyRequest = MenuRequest & { recipe: Recipe | null }

const MEAL_LABEL = { LUNCH: '🌞 Bữa trưa', DINNER: '🌙 Bữa tối' }

const STATUS_BADGE = {
  PLANNED: { label: 'Lên kế hoạch', className: 'border-blue-400 text-blue-600 bg-blue-50' },
  COOKING: { label: 'Đang nấu', className: 'border-amber-400 text-amber-600 bg-amber-50' },
  DONE: { label: 'Hoàn thành', className: 'border-emerald-400 text-emerald-600 bg-emerald-50' },
  CANCELLED: { label: 'Đã hủy', className: 'border-red-400 text-red-500 bg-red-50' },
}

const REQUEST_STATUS = {
  PENDING: {
    label: 'Đang chờ',
    icon: Clock,
    className: 'border-amber-400 text-amber-600 bg-amber-50',
  },
  APPROVED: {
    label: 'Đã duyệt',
    icon: CheckCircle,
    className: 'border-emerald-400 text-emerald-600 bg-emerald-50',
  },
  REJECTED: { label: 'Từ chối', icon: XCircle, className: 'border-red-400 text-red-500 bg-red-50' },
}

interface MemberMenuViewProps {
  menus: DailyMenuWithItems[]
  myRequests: MyRequest[]
  currentUserId: string
}

export function MemberMenuView({ menus, myRequests, currentUserId }: MemberMenuViewProps) {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  // Sắp xếp theo ngày
  const upcomingMenus = [...menus]
    .filter((m) => m.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className='flex flex-col gap-8'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Thực đơn gia đình</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Xem lịch bữa ăn và đề xuất món bạn muốn
          </p>
        </div>
        <Button onClick={() => setRequestDialogOpen(true)} className='shrink-0 gap-2'>
          <Send className='h-4 w-4' />
          Đề xuất món ăn
        </Button>
      </div>

      {/* Upcoming menus */}
      <section className='flex flex-col gap-4'>
        <h2 className='flex items-center gap-2 text-base font-semibold'>
          <CalendarDays className='h-5 w-5 text-primary' />
          Lịch bữa ăn sắp tới
        </h2>

        {upcomingMenus.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 text-muted-foreground'>
            <UtensilsCrossed className='h-10 w-10 opacity-25' />
            <p>Chưa có thực đơn nào được lên kế hoạch</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2'>
            {upcomingMenus.slice(0, 6).map((menu) => {
              const lunchItems = menu.items.filter((i) => i.mealTime === 'LUNCH')
              const dinnerItems = menu.items.filter((i) => i.mealTime === 'DINNER')
              const statusConfig = STATUS_BADGE[menu.status as MenuStatus]

              return (
                <Card key={menu.id} className='overflow-hidden'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <CardTitle className='text-sm font-semibold capitalize'>
                        {new Date(menu.date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </CardTitle>
                      <Badge
                        variant='outline'
                        className={`shrink-0 text-xs ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-3 pt-0'>
                    {/* Bữa trưa */}
                    <div className='flex flex-col gap-1.5'>
                      <span className='flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                        <Sun className='h-3 w-3 text-amber-500' /> Bữa trưa
                      </span>
                      {lunchItems.length === 0 ? (
                        <span className='pl-4 text-xs text-muted-foreground italic'>
                          Chưa lên kế hoạch
                        </span>
                      ) : (
                        <div className='flex flex-col gap-1 pl-4'>
                          {lunchItems.map((item) => (
                            <span key={item.id} className='text-sm'>
                              {item.recipe.name}
                              {item.servings > 1 && (
                                <span className='ml-1 text-xs text-muted-foreground'>
                                  (×{item.servings})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Bữa tối */}
                    <div className='flex flex-col gap-1.5'>
                      <span className='flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                        <Moon className='h-3 w-3 text-indigo-500' /> Bữa tối
                      </span>
                      {dinnerItems.length === 0 ? (
                        <span className='pl-4 text-xs text-muted-foreground italic'>
                          Chưa lên kế hoạch
                        </span>
                      ) : (
                        <div className='flex flex-col gap-1 pl-4'>
                          {dinnerItems.map((item) => (
                            <span key={item.id} className='text-sm'>
                              {item.recipe.name}
                              {item.servings > 1 && (
                                <span className='ml-1 text-xs text-muted-foreground'>
                                  (×{item.servings})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* My requests */}
      <section className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='flex items-center gap-2 text-base font-semibold'>
            <Send className='h-5 w-5 text-primary' />
            Yêu cầu của tôi
          </h2>
          <Button variant='outline' size='sm' onClick={() => setRequestDialogOpen(true)}>
            <Plus className='mr-1 h-4 w-4' />
            Thêm yêu cầu
          </Button>
        </div>

        {myRequests.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 text-muted-foreground'>
            <Send className='h-8 w-8 opacity-25' />
            <p className='text-sm'>Bạn chưa gửi yêu cầu nào</p>
            <Button variant='outline' size='sm' onClick={() => setRequestDialogOpen(true)}>
              <Plus className='mr-1 h-4 w-4' />
              Đề xuất món ăn
            </Button>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            {myRequests.map((req) => {
              const statusConfig = REQUEST_STATUS[req.status as keyof typeof REQUEST_STATUS]
              const StatusIcon = statusConfig.icon
              return (
                <div
                  key={req.id}
                  className='flex items-center justify-between gap-3 rounded-lg border bg-card p-3'
                >
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <span className='text-sm font-medium'>{req.dishName}</span>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                      {req.mealTime && (
                        <span>{MEAL_LABEL[req.mealTime as keyof typeof MEAL_LABEL]}</span>
                      )}
                      {req.date && <span>📅 {new Date(req.date).toLocaleDateString('vi-VN')}</span>}
                      {req.note && <span className='truncate italic'>"{req.note}"</span>}
                    </div>
                  </div>
                  <Badge variant='outline' className={`shrink-0 text-xs ${statusConfig.className}`}>
                    <StatusIcon className='mr-1 h-3 w-3' />
                    {statusConfig.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <RequestDishDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />
    </div>
  )
}
