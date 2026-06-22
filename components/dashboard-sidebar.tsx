'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconDashboard,
  IconFridge,
  IconChefHat,
  IconLogout,
} from '@tabler/icons-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { logoutAction } from '@/app/actions/auth'

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: string
  userName?: string
}

export function DashboardSidebar({ userRole, userName, ...props }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()

  const navItems = [
    {
      title: 'Tổng quan',
      url: '/dashboard',
      icon: IconDashboard,
      roles: ['ADMIN', 'HOMEMAKER'],
    },
    {
      title: 'Tủ lạnh',
      url: '/dashboard/fridge',
      icon: IconFridge,
      roles: ['ADMIN', 'HOMEMAKER', 'DEVICE'],
    },
    {
      title: 'Thực đơn',
      url: '/dashboard/menu',
      icon: IconChefHat,
      roles: ['ADMIN', 'HOMEMAKER'],
    },
  ]

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !userRole || item.roles.includes(userRole)
  )

  return (
    <Sidebar collapsible='icon' className='border-r' {...props}>
      <SidebarHeader className='border-b py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href='/dashboard'>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconFridge className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className='text-lg font-bold'>HomieFridge</span>
                  <span className="text-xs text-muted-foreground">{userName || 'Quản lý'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="text-base py-6"
              >
                <Link href={item.url}>
                  <item.icon className='size-6!' />
                  <span className="text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logoutAction}>
              <SidebarMenuButton 
                type="submit" 
                tooltip="Đăng xuất"
                className="text-base text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <IconLogout className='size-6!' />
                <span className="text-base">Đăng xuất</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
