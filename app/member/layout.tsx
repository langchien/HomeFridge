import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, UtensilsCrossed, User } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* Simple top nav for members */}
      <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <span className='text-xl font-bold text-primary'>🏠 HomieFridge</span>
          </div>
          <nav className='flex items-center gap-1'>
            <Link
              href='/'
              className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <Home className='h-4 w-4' />
              Trang chủ
            </Link>
            <Link
              href='/member/menu'
              className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            >
              <UtensilsCrossed className='h-4 w-4' />
              Thực đơn
            </Link>
          </nav>
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              <span>{currentUser.name}</span>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-6'>{children}</main>
    </div>
  )
}
