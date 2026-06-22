'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { comparePassword, signJWT, JWTPayload } from '@/lib/auth'

export interface ActionResponse {
  success?: boolean
  error?: string
}

/**
 * Server Action xử lý Đăng nhập
 */
export async function loginAction(values: any): Promise<ActionResponse> {
  try {
    const { username, password } = values

    if (!username || !password) {
      return { error: 'Vui lòng nhập đầy đủ thông tin!' }
    }

    // 1. Tìm user trong DB
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return { error: 'Tài khoản hoặc mật khẩu không chính xác!' }
    }

    // 2. So khớp mật khẩu
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return { error: 'Tài khoản hoặc mật khẩu không chính xác!' }
    }

    // 3. Ký JWT
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role as 'ADMIN' | 'MEMBER' | 'DEVICE' | 'HOMEMAKER',
    }
    const token = signJWT(payload)

    // 4. Thiết lập thời gian sống cookie (DEVICE: 10 năm, ADMIN/MEMBER: 30 ngày)
    const maxAge = user.role === 'DEVICE' ? 10 * 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60

    // 5. Lưu token vào Cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return { success: true }
  } catch (error) {
    console.error('Lỗi khi thực hiện login action:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra!' }
  }
}

/**
 * Server Action xử lý Đăng xuất
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  } catch (error) {
    console.error('Lỗi khi thực hiện logout action:', error)
  }

  // Gọi redirect ở ngoài try-catch để Next.js xử lý điều hướng chính xác
  redirect('/login')
}
