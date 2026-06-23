import { getWeekShoppingAction } from '@/app/actions/shopping'
import { getIngredientsAction } from '@/app/actions/ingredient'
import { getCurrentUser } from '@/lib/auth'
import { getWeekStart } from '@/lib/week-utils'
import { redirect } from 'next/navigation'
import { ShoppingClient } from './components/shopping-client'

export const metadata = {
  title: 'Quản lý đi chợ',
}

export default async function ShoppingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Chỉ MEMBER và HOMEMAKER được truy cập
  if (user.role !== 'MEMBER' && user.role !== 'HOMEMAKER') {
    redirect('/dashboard') // redirect về trang chủ nếu không có quyền
  }

  const initialWeekStart = getWeekStart(new Date())

  // Lấy dữ liệu tuần hiện tại và danh sách ingredients
  const [{ data: initialLists, error }, { data: ingredients }] = await Promise.all([
    getWeekShoppingAction(initialWeekStart),
    getIngredientsAction(),
  ])

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý đi chợ</h1>
          <p className='text-muted-foreground'>Lên danh sách và kiểm tra thực phẩm cần mua</p>
        </div>
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive'>
          {error}
        </div>
      ) : (
        <ShoppingClient
          initialWeekStart={initialWeekStart}
          initialLists={initialLists || []}
          ingredients={ingredients || []}
        />
      )}
    </div>
  )
}
