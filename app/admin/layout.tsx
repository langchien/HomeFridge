import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, LogOut } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { ModeToggle } from '@/components/mode-toggle'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='flex min-h-screen flex-col bg-muted/30 dark:bg-background'>
      {/* Top navigation header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20'>
              H
            </div>
            <span className='text-lg font-bold tracking-tight text-foreground'>HomieFridge</span>
            <span className='rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase'>
              Admin
            </span>
          </div>

          <div className='flex items-center gap-4'>
            {/* User profile section */}
            <div className='flex items-center gap-3 border-r pr-4'>
              <Avatar className='size-8 border border-muted/50'>
                <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} />
                <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary uppercase'>
                  {currentUser.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className='hidden flex-col sm:flex'>
                <span className='text-xs leading-none font-semibold text-foreground'>
                  {currentUser.name}
                </span>
                <span className='mt-0.5 text-[10px] text-muted-foreground'>
                  @{currentUser.username}
                </span>
              </div>
            </div>

            {/* Quick Actions (ModeToggle, Home, Logout) */}
            <div className='flex items-center gap-2'>
              <ModeToggle />
              <Link href='/'>
                <Button variant='outline' size='sm' className='h-8 gap-1.5 text-xs'>
                  <Home className='size-3.5' />
                  <span className='hidden md:inline'>Trang chủ</span>
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'
                >
                  <LogOut className='size-3.5' />
                  <span className='hidden md:inline'>Đăng xuất</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <div className='flex-1'>{children}</div>

      {/* Simple Footer */}
      <footer className='border-t bg-background py-6'>
        <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row'>
          <p>© {new Date().getFullYear()} HomieFridge. Tất cả quyền được bảo lưu.</p>
          <p>Thiết lập bảo mật & phân quyền nội bộ.</p>
        </div>
      </footer>
    </div>
  )
}
