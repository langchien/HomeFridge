import { getFridgeItemsAction } from '@/app/actions/fridge'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FridgeStats } from './components/fridge-stats'
import { FridgeView } from './components/fridge-view'

export const metadata = {
  title: 'Quản lý tủ lạnh | HomeFridge',
  description: 'Quản lý nguyên liệu trong tủ lạnh, theo dõi ngày hết hạn và tình trạng tươi mới.',
}

export default async function FridgePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Chỉ HOMEMAKER, ADMIN, DEVICE và MEMBER được vào trang tủ lạnh
  if (!['HOMEMAKER', 'DEVICE', 'ADMIN', 'MEMBER'].includes(user.role)) {
    redirect('/dashboard')
  }

  const { data: items, error } = await getFridgeItemsAction()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
          Tủ Lạnh
        </h1>
        <p className='mt-1 max-w-2xl text-muted-foreground'>
          Quản lý nguyên liệu, theo dõi ngày hết hạn và tình trạng tươi mới trong tủ lạnh gia đình.
        </p>
      </div>

      {/* Stats */}
      <FridgeStats items={items || []} />

      {/* View (Grid / Table) */}
      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/30'>
          <p className='text-sm font-medium text-red-700 dark:text-red-400'>Lỗi: {error}</p>
        </div>
      ) : (
        <FridgeView items={items || []} />
      )}
    </div>
  )
}
