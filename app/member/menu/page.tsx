import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MemberMenuView } from './components/member-menu-view'

export default async function MemberMenuPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  const [menus, myRequests] = await Promise.all([
    // Chỉ hiển thị menu không bị hủy
    prisma.dailyMenu.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: {
        items: {
          include: {
            recipe: { include: { ingredients: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    }),

    // Yêu cầu của user hiện tại
    prisma.menuRequest.findMany({
      where: { userId: currentUser.id },
      include: { recipe: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <MemberMenuView menus={menus as any} myRequests={myRequests} currentUserId={currentUser.id} />
  )
}
