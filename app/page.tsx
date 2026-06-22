import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isDevice = user.role === 'DEVICE'
  const isAdmin = user.role === 'ADMIN'

  if (isAdmin) {
    redirect('/admin')
  }

  if (isDevice) {
    redirect('/dashboard/fridge')
  }

  // Default for Homemaker or other roles
  redirect('/dashboard')
}
