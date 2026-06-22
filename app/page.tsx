import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  if (user.role === 'DEVICE') {
    redirect('/dashboard/fridge')
  }

  if (user.role === 'MEMBER') {
    redirect('/member/menu')
  }

  // Mặc định cho HOMEMAKER
  redirect('/dashboard')
}
