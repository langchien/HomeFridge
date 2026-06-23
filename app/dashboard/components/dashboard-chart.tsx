import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { DashboardChartClient } from './dashboard-chart-client'

export async function DashboardChart() {
  const items = await prisma.fridgeItem.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  })

  let fresh = 0
  let expiring = 0
  let expired = 0

  items.forEach((item) => {
    if (item.status === 'FRESH') fresh = item._count.status
    if (item.status === 'EXPIRING_SOON') expiring = item._count.status
    if (item.status === 'EXPIRED') expired = item._count.status
  })

  const data = [
    { name: 'fresh', value: fresh, fill: '#10b981' }, // emerald-500
    { name: 'expiring', value: expiring, fill: '#f59e0b' }, // amber-500
    { name: 'expired', value: expired, fill: '#ef4444' }, // red-500
  ]

  return (
    <Card className='col-span-full border-muted/60 shadow-sm md:col-span-1'>
      <CardHeader>
        <CardTitle>Tình trạng thực phẩm</CardTitle>
        <CardDescription>Tỷ lệ độ tươi của nguyên liệu trong tủ lạnh</CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardChartClient data={data} />
      </CardContent>
    </Card>
  )
}
