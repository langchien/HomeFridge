import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MenuTabs } from './components/menu-tabs'
import { CalendarDays } from 'lucide-react'

export default async function MenuPage() {
  // Kiểm tra quyền truy cập (middleware đã check, nhưng double-check ở server)
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'HOMEMAKER') {
    redirect('/')
  }

  // Fetch tất cả data cần thiết
  const [menus, recipes, requests, fridgeItems] = await Promise.all([
    prisma.dailyMenu.findMany({
      include: {
        items: {
          include: {
            recipe: {
              include: { ingredients: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    }),

    prisma.recipe.findMany({
      include: { ingredients: true },
      orderBy: { name: 'asc' },
    }),

    prisma.menuRequest.findMany({
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        recipe: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    prisma.fridgeItem.findMany({
      select: { id: true, name: true, quantity: true, unit: true },
      orderBy: { name: 'asc' },
      where: { quantity: { gt: 0 } },
    }),
  ])

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className='flex flex-col gap-6 p-6 pb-16'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <CalendarDays className='h-8 w-8 text-primary' />
            Quản lý thực đơn
          </h1>
          <p className='mt-1 text-muted-foreground'>
            Lên kế hoạch bữa ăn, quản lý công thức và xử lý yêu cầu từ thành viên
          </p>
        </div>

        {/* Quick stats */}
        <div className='hidden items-center gap-6 md:flex'>
          <div className='text-center'>
            <p className='text-2xl font-bold'>{menus.length}</p>
            <p className='text-xs text-muted-foreground'>Menu ngày</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold'>{recipes.length}</p>
            <p className='text-xs text-muted-foreground'>Công thức</p>
          </div>
          {pendingCount > 0 && (
            <div className='text-center'>
              <p className='text-2xl font-bold text-amber-500'>{pendingCount}</p>
              <p className='text-xs text-muted-foreground'>Chờ duyệt</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <MenuTabs
        menus={menus as any}
        recipes={recipes as any}
        requests={requests as any}
        fridgeItems={fridgeItems}
      />
    </div>
  )
}
