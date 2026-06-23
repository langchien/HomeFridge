'use client'

import {
  IconBook2,
  IconChefHat,
  IconDashboard,
  IconFridge,
  IconLogout,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { logoutAction } from '@/app/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: string
  userName?: string
  userAvatar?: string | null
  userUsername?: string
}

export function DashboardSidebar({
  userRole,
  userName,
  userAvatar,
  userUsername,
  ...props
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()

  const navItems = [
    {
      title: 'Quản lý người dùng',
      url: '/dashboard/user',
      icon: IconUsers,
      roles: ['ADMIN'],
    },
    {
      title: 'Tổng quan',
      url: '/dashboard',
      icon: IconDashboard,
      roles: ['HOMEMAKER'],
    },
    {
      title: 'Quản lý nguyên liệu',
      url: '/dashboard/ingredients',
      icon: IconFridge,
      roles: ['ADMIN'],
    },
    {
      title: 'Quản lý công thức',
      url: '/dashboard/recipes',
      icon: IconBook2,
      roles: ['ADMIN'],
    },
    {
      title: 'Tủ lạnh',
      url: '/dashboard/fridge',
      icon: IconFridge,
      roles: ['HOMEMAKER', 'DEVICE'],
    },
    {
      title: 'Quản lý thực đơn',
      url: '/dashboard/menu',
      icon: IconChefHat,
      roles: ['HOMEMAKER'],
    },
    {
      title: 'Quản lý đi chợ',
      url: '/dashboard/shopping',
      icon: IconShoppingCart,
      roles: ['HOMEMAKER', 'MEMBER'],
    },
  ]

  // Filter items based on user role
  const filteredNavItems = navItems.filter((item) => !userRole || item.roles.includes(userRole))

  return (
    <Sidebar collapsible='icon' className='border-r' {...props}>
      <SidebarHeader className='border-b py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/dashboard'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <IconFridge className='size-5' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='text-lg font-bold'>HomeFridge</span>
                  <span className='text-muted-foreground'>
                    {userRole === 'ADMIN'
                      ? 'Quản trị'
                      : userRole === 'HOMEMAKER'
                        ? 'Nội trợ'
                        : userRole === 'MEMBER'
                          ? 'Thành viên'
                          : 'Thiết bị'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='py-4'>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className='py-6 text-base'
              >
                <Link href={item.url}>
                  <item.icon className='size-6!' />
                  <span className='text-base'>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className='flex flex-col gap-3 border-t p-4'>
        {/* Khối Profile người dùng */}
        <div className='flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all'>
          <Avatar className='size-9 shrink-0 border border-muted/80 shadow-sm'>
            <AvatarImage src={userAvatar || ''} alt={userName} />
            <AvatarFallback className='bg-primary/10 font-bold text-primary uppercase'>
              {userName ? userName.substring(0, 2) : 'US'}
            </AvatarFallback>
          </Avatar>
          {state !== 'collapsed' && (
            <div className='flex min-w-0 flex-1 flex-col text-left leading-tight'>
              <span className='truncate font-semibold text-foreground'>
                {userName || 'Người dùng'}
              </span>
              <span className='truncate text-sm text-muted-foreground'>
                @{userUsername || 'user'}
              </span>
            </div>
          )}
        </div>

        {/* Nút Đăng xuất */}
        <form action={logoutAction} className='w-full'>
          <SidebarMenuButton
            type='submit'
            tooltip='Đăng xuất'
            className='w-full gap-3 rounded-lg px-3 py-6 text-base text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
          >
            <IconLogout className='size-6!' />
            <span>Đăng xuất</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
