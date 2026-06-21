import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-homie-fridge-secret-key-123456'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface JWTPayload {
  userId: string
  username: string
  role: 'ADMIN' | 'MEMBER' | 'DEVICE'
}

/**
 * Ký JWT token dựa trên thông tin User.
 * Nếu là DEVICE (thiết bị dùng chung), token sống 10 năm (3650 ngày).
 * Nếu là ADMIN/MEMBER, token sống 30 ngày.
 */
export function signJWT(payload: JWTPayload): string {
  const expiresIn = payload.role === 'DEVICE' ? '3650d' : '30d'
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Xác thực JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Lấy User hiện tại đang đăng nhập từ Cookie trong Server Components, Server Actions hoặc API Routes.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  try {
    const decoded = verifyJWT(token)
    if (!decoded || !decoded.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user hiện tại:', error)
    return null
  }
}
