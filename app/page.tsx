import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { logoutAction } from '@/app/actions/auth'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const isDevice = user.role === 'DEVICE'
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-6">
          <Avatar className="h-16 w-16">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="text-lg font-bold">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
            <CardDescription className="font-mono">@{user.username}</CardDescription>
          </div>

          <div className="ml-auto">
            <Badge variant={isAdmin ? 'destructive' : isDevice ? 'secondary' : 'default'}>
              {user.role}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 py-6">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Email liên lạc
              </span>
              <p className="font-medium text-foreground">{user.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Số điện thoại
              </span>
              <p className="font-medium text-foreground">{user.phone || 'Chưa cập nhật'}</p>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Trạng thái phiên đăng nhập
            </span>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>
                {isDevice
                  ? 'Phiên đăng nhập dài hạn trên thiết bị (10 năm)'
                  : 'Duy trì đăng nhập tiêu chuẩn (30 ngày)'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 border-t pt-6 sm:flex-row">
          {isAdmin && (
            <Link href="/admin" className="w-full sm:w-auto">
              <Button variant="default" className="w-full">
                Vào trang Admin
              </Button>
            </Link>
          )}

          {isDevice && (
            <span className="text-xs text-muted-foreground">
              📱 Thiết bị dùng chung tại tủ lạnh
            </span>
          )}

          <form action={logoutAction} className="w-full sm:ml-auto sm:w-auto">
            <Button type="submit" variant="outline" className="w-full">
              Đăng xuất
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
