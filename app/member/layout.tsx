import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ModeToggle } from '@/components/mode-toggle'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <DashboardSidebar userRole={currentUser.role} userName={currentUser.name} />
        <SidebarInset className='relative flex h-screen flex-col overflow-hidden'>
          {/* Top Bar */}
          <header className='flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='h-9 w-9 border bg-background shadow-sm' />
              <div className='mx-2 h-4 w-[1px] bg-muted' />
              <span className='text-sm font-semibold tracking-tight text-teal-600 uppercase'>
                Khu vực Thành viên
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <ModeToggle />
            </div>
          </header>

          {/* Main Member Content */}
          <main className='flex-1 overflow-auto bg-muted/10 p-6'>
            <div className='mx-auto w-full max-w-5xl'>{children}</div>
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
