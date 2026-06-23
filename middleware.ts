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
  const role = decoded.role
  
  // 3. Phân quyền truy cập cho khu vực Dashboard
  if (pathname.startsWith('/dashboard')) {
    if (role === 'ADMIN') {
      // ADMIN chỉ vào được user và recipes
      if (!pathname.startsWith('/dashboard/user') && !pathname.startsWith('/dashboard/recipes')) {
        return NextResponse.redirect(new URL('/dashboard/user', request.url))
      }
    } else if (role === 'HOMEMAKER') {
      // HOMEMAKER vào được các trang trừ user và recipes
      if (pathname.startsWith('/dashboard/user') || pathname.startsWith('/dashboard/recipes')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } else if (role === 'DEVICE') {
      // DEVICE chỉ vào được duy nhất fridge
      if (!pathname.startsWith('/dashboard/fridge')) {
        return NextResponse.redirect(new URL('/dashboard/fridge', request.url))
      }
    } else if (role === 'MEMBER') {
      // MEMBER chỉ được vào shopping
      if (!pathname.startsWith('/dashboard/shopping')) {
        return NextResponse.redirect(new URL('/dashboard/shopping', request.url))
      }
    } else {
      // Fallback an toàn cho trường hợp không xác định
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
