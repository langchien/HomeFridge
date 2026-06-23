import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Xác định màu sắc và tên nhãn hiển thị cho từng vai trò
  const getRoleBadgeConfig = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin',
          classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20',
        }
      case 'HOMEMAKER':
        return {
          label: 'Nội trợ',
          classes: 'bg-teal-500/10 text-teal-500 border-teal-500/20 dark:bg-teal-500/20',
        }
      case 'MEMBER':
        return {
          label: 'Thành viên',
          classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20',
        }
      case 'DEVICE':
        return {
          label: 'Thiết bị',
          classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20',
        }
      default:
        return {
          label: 'Thành viên',
          classes: 'bg-muted text-muted-foreground border-muted-foreground/20',
        }
    }
  }

  const badgeConfig = getRoleBadgeConfig(user.role)

  return (
    <SidebarProvider>
      <TooltipProvider>
        <DashboardSidebar
          userRole={user.role}
          userName={user.name}
          userAvatar={user.avatar}
          userUsername={user.username}
        />
        <SidebarInset className='relative flex h-screen flex-col overflow-hidden'>
          {/* Header Bar dùng chung của Dashboard */}
          <header className='z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-6 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/60'>
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='h-9 w-9 rounded-lg border bg-background shadow-sm transition-all hover:bg-muted' />
              <div className='mx-2 h-4 w-px bg-muted' />
              <div className='flex items-center gap-2.5'>
                <span className='font-bold tracking-tight text-foreground sm:text-base'>
                  HomeFridge
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wider uppercase shadow-sm ${badgeConfig.classes}`}
                >
                  {badgeConfig.label}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <ModeToggle />
            </div>
          </header>

          {/* Nội dung chính của các phân hệ */}
          <main className='flex-1 overflow-auto'>
            <div className='container mx-auto max-w-7xl space-y-8 px-4 py-8'>{children}</div>
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
