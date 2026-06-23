import { getWeekMenuAction } from '@/app/actions/menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekStart } from '@/lib/week-utils'
import { ChefHat } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { MenuClient } from './components/menu-client'

export const metadata: Metadata = {
  title: 'Quản lý thực đơn | HomeFridge',
  description: 'Lên kế hoạch thực đơn theo tuần cho gia đình',
}

export default async function MenuPage() {
  // ── Phân quyền: chỉ HOMEMAKER và ADMIN được vào ──────────────
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/login')
  // Chỉ HOMEMAKER được vào trang quản lý thực đơn
  if (currentUser.role !== 'HOMEMAKER') {
    redirect('/dashboard')
  }

  // ── Tính đầu tuần hiện tại (Thứ 2) ───────────────────────────
  const weekStart = getWeekStart(new Date())

  // ── Fetch song song: recipes + menu tuần hiện tại ─────────────
  const [recipesRaw, weekMenuResult] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        prepTime: true,
        cookTime: true,
        servings: true,
        description: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    getWeekMenuAction(weekStart),
  ])

  const recipes = recipesRaw as any[]
  const initialPlans = weekMenuResult.data ?? []

  // ── Thống kê nhanh ────────────────────────────────────────────
  const totalPlanned = initialPlans.filter((p) => p.status === 'PLANNED').length
  const totalDone = initialPlans.filter((p) => p.status === 'DONE').length
  const totalThisWeek = initialPlans.length

  return (
    <div className='flex flex-col gap-6 p-6 pb-16'>
      {/* Tiêu đề trang */}
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-teal-600/10'>
          <ChefHat className='size-5 text-teal-600' />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý thực đơn</h1>
          <p className='text-muted-foreground'>Lên kế hoạch bữa ăn theo tuần cho cả gia đình</p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className='grid gap-3 sm:grid-cols-3'>
        <Card className='border-teal-200/60 bg-teal-50/40 shadow-sm dark:border-teal-900/40 dark:bg-teal-950/20'>
          <CardHeader className='pb-1'>
            <CardTitle className='text-4xl font-bold text-teal-600'>{totalThisWeek}</CardTitle>
            <CardDescription className='font-semibold text-foreground'>
              Món trong tuần này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>Tổng số món đã lên thực đơn tuần này.</p>
          </CardContent>
        </Card>

        <Card className='border-blue-200/60 bg-blue-50/40 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20'>
          <CardHeader className='pb-1'>
            <CardTitle className='text-4xl font-bold text-blue-600'>{totalPlanned}</CardTitle>
            <CardDescription className='font-semibold text-foreground'>Đã kế hoạch</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>Số món đang ở trạng thái chờ nấu.</p>
          </CardContent>
        </Card>

        <Card className='border-emerald-200/60 bg-emerald-50/40 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20'>
          <CardHeader className='pb-1'>
            <CardTitle className='text-4xl font-bold text-emerald-600'>{totalDone}</CardTitle>
            <CardDescription className='font-semibold text-foreground'>
              Đã hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>Số món đã được nấu xong trong tuần.</p>
          </CardContent>
        </Card>
      </div>

      {/* Client component — lịch tuần + bảng chi tiết */}
      <MenuClient initialWeekStart={weekStart} initialPlans={initialPlans} recipes={recipes} />
    </div>
  )
}
