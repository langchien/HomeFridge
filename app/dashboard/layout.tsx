import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <DashboardSidebar userRole={user.role} userName={user.name} />
        <SidebarInset className="relative flex flex-col h-screen overflow-hidden">
          {/* Nút bấm chủ động (chuyển sang bên phải sidebar) */}
          <div className="absolute left-4 top-4 z-50">
            <SidebarTrigger className="bg-background/80 backdrop-blur-md shadow-md border rounded-full size-10" />
          </div>
          
          {/* Nội dung chính */}
          <main className="flex-1 overflow-auto bg-muted/20">
            {children}
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
