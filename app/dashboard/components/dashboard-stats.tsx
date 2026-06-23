import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { AlertTriangle, Refrigerator, ShoppingCart, Utensils } from 'lucide-react'

export async function DashboardStats() {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const [todayMenus, expiringFridgeItems, pendingShoppingItems, totalFridgeItems] =
    await Promise.all([
      // Thực đơn hôm nay
      prisma.menuPlan.count({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Nguyên liệu sắp hỏng / đã hỏng
      prisma.fridgeItem.count({
        where: {
          status: {
            in: ['EXPIRING_SOON', 'EXPIRED'],
          },
        },
      }),
      // Đi chợ tuần này
      prisma.shoppingListItem.count({
        where: {
          isBought: false,
          shoppingList: {
            date: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        },
      }),
      // Tổng nguyên liệu trong tủ
      prisma.fridgeItem.count(),
    ])

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card className='border-muted/60 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Thực đơn hôm nay</CardTitle>
          <Utensils className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{todayMenus} món</div>
          <p className='text-xs text-muted-foreground'>cần chuẩn bị nấu</p>
        </CardContent>
      </Card>

      <Card className='border-rose-200/60 bg-rose-50/40 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium text-rose-600 dark:text-rose-400'>
            Cảnh báo tủ lạnh
          </CardTitle>
          <AlertTriangle className='size-4 text-rose-600 dark:text-rose-400' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-rose-600 dark:text-rose-400'>
            {expiringFridgeItems}
          </div>
          <p className='text-xs text-rose-600/80 dark:text-rose-400/80'>
            nguyên liệu sắp/đã hết hạn
          </p>
        </CardContent>
      </Card>

      <Card className='border-muted/60 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Danh sách đi chợ</CardTitle>
          <ShoppingCart className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{pendingShoppingItems}</div>
          <p className='text-xs text-muted-foreground'>mặt hàng chưa mua tuần này</p>
        </CardContent>
      </Card>

      <Card className='border-muted/60 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tình trạng tủ lạnh</CardTitle>
          <Refrigerator className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalFridgeItems}</div>
          <p className='text-xs text-muted-foreground'>nguyên liệu đang lưu trữ</p>
        </CardContent>
      </Card>
    </div>
  )
}
