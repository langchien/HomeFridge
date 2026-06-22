import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Giải mã JWT Payload mà không cần verify chữ ký (dành riêng cho Edge Runtime của Next.js Middleware).
 * Việc verify chữ ký bảo mật sẽ được thực hiện chặt chẽ tại API/Server Component qua `getCurrentUser()`.
 */
function decodeJWTPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadB64 = parts[1]
    // Giải mã base64 trong Edge Runtime
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payloadStr)
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // 1. Nếu người dùng cố gắng vào trang /login
  if (pathname === '/login') {
    if (token) {
      const decoded = decodeJWTPayload(token)
      if (decoded && decoded.userId) {
        // Đã đăng nhập, redirect về trang chủ
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    // Chưa đăng nhập, cho phép truy cập /login bình thường
    return NextResponse.next()
  }

  // 2. Với các trang nội bộ khác
  if (!token) {
    // Chưa đăng nhập, chuyển hướng về trang /login
    const loginUrl = new URL('/login', request.url)
    // Lưu lại trang đích để sau khi login xong có thể redirect lại
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const decoded = decodeJWTPayload(token)
  if (!decoded || !decoded.userId) {
    // Token không hợp lệ, xóa token và chuyển hướng về /login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // 3. Phân quyền truy cập cho khu vực Dashboard User
  if (pathname.startsWith('/dashboard/user')) {
    if (decoded.role !== 'ADMIN') {
      // Không phải Admin, chuyển hướng về trang chủ
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 3b. Phân quyền truy cập cho khu vực Recipes (chỉ Admin)
  if (pathname.startsWith('/dashboard/recipes')) {
    if (decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 3c. Phân quyền truy cập cho khu vực Menu (chỉ HOMEMAKER)
  if (pathname.startsWith('/dashboard/menu')) {
    if (decoded.role !== 'HOMEMAKER') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 3d. Phân quyền truy cập cho khu vực Fridge (chỉ HOMEMAKER và DEVICE)
  if (pathname.startsWith('/dashboard/fridge')) {
    const isAllowed = decoded.role === 'HOMEMAKER' || decoded.role === 'DEVICE'
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 4. Phân quyền chung cho khu vực Dashboard
  // (HOMEMAKER và ADMIN truy cập các trang còn lại; các trang cụ thể đã xử lý riêng bên trên)
  if (pathname.startsWith('/dashboard')) {
    const isHomemakerOrAdmin = decoded.role === 'HOMEMAKER' || decoded.role === 'ADMIN'
    if (!isHomemakerOrAdmin) {
      // DEVICE và MEMBER không có trong whitelist trên sẽ bị redirect
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Cấu hình các route sẽ áp dụng middleware
export const config = {
  matcher: [
    /*
     * Match tất cả các URL ngoại trừ:
     * - api/auth/login (API đăng nhập)
     * - login (trang đăng nhập)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo, ảnh trong thư mục public
     */
    '/((?!api/auth/login|login|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
}
