import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const mealTimeLabel = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
}

const statusLabel = {
  PLANNED: 'Sắp nấu',
  COOKING: 'Đang nấu',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

export async function DashboardTables() {
  // Query expiring items
  const expiringItems = await prisma.fridgeItem.findMany({
    where: {
      status: { in: ['EXPIRING_SOON', 'EXPIRED'] },
    },
    include: { ingredient: true },
    orderBy: { expiryDate: 'asc' },
    take: 5,
  })

  // Query today's menu
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayMenus = await prisma.menuPlan.findMany({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: { recipe: true },
    orderBy: { mealTime: 'asc' },
  })

  return (
    <div className='col-span-full grid grid-cols-1 gap-4 md:col-span-2 lg:grid-cols-2'>
      <Card className='border-muted/60 shadow-sm'>
        <CardHeader>
          <CardTitle>Nguyên liệu sắp hết hạn</CardTitle>
          <CardDescription>Cần ưu tiên sử dụng ngay</CardDescription>
        </CardHeader>
        <CardContent>
          {expiringItems.length === 0 ? (
            <div className='flex h-[200px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'>
              Không có nguyên liệu nào sắp hết hạn.
            </div>
          ) : (
            <div className='space-y-4'>
              {expiringItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'
                >
                  <div>
                    <p className='font-medium'>{item.ingredient.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Hết hạn: {format(item.expiryDate, 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  <Badge variant={item.status === 'EXPIRED' ? 'destructive' : 'secondary'}>
                    {item.status === 'EXPIRED' ? 'Đã hỏng' : 'Sắp hỏng'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='border-muted/60 shadow-sm'>
        <CardHeader>
          <CardTitle>Thực đơn hôm nay</CardTitle>
          <CardDescription>Các món ăn đã được lên lịch</CardDescription>
        </CardHeader>
        <CardContent>
          {todayMenus.length === 0 ? (
            <div className='flex h-[200px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'>
              Chưa có thực đơn nào cho hôm nay.
            </div>
          ) : (
            <div className='space-y-4'>
              {todayMenus.map((menu) => (
                <div
                  key={menu.id}
                  className='flex items-center justify-between border-b pb-3 last:border-0 last:pb-0'
                >
                  <div>
                    <p className='font-medium line-clamp-1'>{menu.recipe.title}</p>
                    <p className='text-xs text-muted-foreground'>{mealTimeLabel[menu.mealTime]}</p>
                  </div>
                  <Badge variant='outline'>{statusLabel[menu.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
