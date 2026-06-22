import { prisma } from '@/lib/prisma'
import { FridgeItemWithRelations, columns } from './components/columns'
import { FridgeTable } from './components/fridge-table'
import { FloatingActionButtons } from './components/floating-action-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, AlertCircle } from 'lucide-react'

export default async function FridgePage() {
  // Fetch data song song để tối ưu hóa hiệu năng
  const [rawItems, categories, users] = await Promise.all([
    prisma.fridgeItem.findMany({
      include: {
        category: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  const items = rawItems as FridgeItemWithRelations[]

  // Tính toán thống kê
  const totalItems = items.length
  
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  let expiredCount = 0
  let expiringSoonCount = 0

  items.forEach((item) => {
    if (item.expiryDate) {
      if (item.expiryDate < now) {
        expiredCount++
      } else if (item.expiryDate < threeDaysFromNow) {
        expiringSoonCount++
      }
    }
  })

  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tủ lạnh của bạn</h1>
          <p className='text-muted-foreground'>Quản lý thực phẩm và hạn sử dụng</p>
        </div>
      </div>

      {/* Top Status Card */}
      <div className='grid gap-6 md:grid-cols-3'>
        <Card className='md:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-4xl font-bold'>{totalItems}</CardTitle>
            <CardDescription>Thực phẩm đang có trong tủ</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Hãy chú ý sử dụng các thực phẩm sắp hết hạn để tránh lãng phí nhé!
            </p>
          </CardContent>
        </Card>

        {/* Alerts Container */}
        <div className='md:col-span-2 flex flex-col gap-3 justify-center'>
          {expiredCount > 0 && (
            <Alert variant='destructive' className='bg-destructive/10 border-destructive/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Cảnh báo hết hạn</AlertTitle>
              <AlertDescription>
                Có <strong>{expiredCount}</strong> thực phẩm đã quá hạn sử dụng. Vui lòng kiểm tra và xử lý ngay!
              </AlertDescription>
            </Alert>
          )}

          {expiringSoonCount > 0 && (
            <Alert className='border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Sắp hết hạn</AlertTitle>
              <AlertDescription>
                Có <strong>{expiringSoonCount}</strong> thực phẩm sẽ hết hạn trong vòng 3 ngày tới. Ưu tiên chế biến nhé!
              </AlertDescription>
            </Alert>
          )}

          {expiredCount === 0 && expiringSoonCount === 0 && (
            <Alert className='border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Tủ lạnh sạch sẽ!</AlertTitle>
              <AlertDescription>
                Không có thực phẩm nào hết hạn hay sắp hết hạn. Rất tuyệt vời!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Main Content Area — FridgeTable tự quản lý toggle List/Grid */}
      <FridgeTable columns={columns} data={items} categories={categories} users={users} />

      <FloatingActionButtons categories={categories} users={users} />
    </div>
  )
}
