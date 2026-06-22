'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export interface ActionResponse {
  success?: boolean
  error?: string
}

/**
 * Kiểm tra xem người dùng hiện tại có quyền ADMIN không
 */
async function checkAdminAuth(): Promise<ActionResponse | null> {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return { error: 'Bạn không có quyền thực hiện hành động này!' }
  }
  return null
}

/**
 * Server Action: Thêm người dùng mới
 */
export async function createUserAction(values: any): Promise<ActionResponse> {
  try {
    const authError = await checkAdminAuth()
    if (authError) return authError

    const { username, password, name, email, phone, role, avatar } = values

    if (!username || !password || !name) {
      return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Username, Password, Name)!' }
    }

    // Kiểm tra username trùng lặp
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return { error: 'Tên đăng nhập đã tồn tại trên hệ thống!' }
    }

    // Kiểm tra email trùng lặp (nếu có nhập email)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })
      if (existingEmail) {
        return { error: 'Email đã được sử dụng bởi một tài khoản khác!' }
      }
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email: email || null,
        phone: phone || null,
        role: role || 'MEMBER',
        avatar: avatar || null,
      },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi thêm người dùng:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi thêm người dùng!' }
  }
}

/**
 * Server Action: Cập nhật thông tin người dùng
 */
export async function updateUserAction(id: string, values: any): Promise<ActionResponse> {
  try {
    const authError = await checkAdminAuth()
    if (authError) return authError

    const { username, password, name, email, phone, role, avatar } = values

    if (!username || !name) {
      return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc (Username, Name)!' }
    }

    // Kiểm tra username trùng lặp với user khác
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id },
      },
    })

    if (existingUser) {
      return { error: 'Tên đăng nhập đã tồn tại trên hệ thống!' }
    }

    // Kiểm tra email trùng lặp (nếu có nhập email)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      })
      if (existingEmail) {
        return { error: 'Email đã được sử dụng bởi một tài khoản khác!' }
      }
    }

    const updateData: any = {
      username,
      name,
      email: email || null,
      phone: phone || null,
      role: role || 'MEMBER',
      avatar: avatar || null,
    }

    // Nếu thay đổi mật khẩu
    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi cập nhật người dùng!' }
  }
}

/**
 * Server Action: Xóa người dùng
 */
export async function deleteUserAction(id: string): Promise<ActionResponse> {
  try {
    const authError = await checkAdminAuth()
    if (authError) return authError

    const currentUser = await getCurrentUser()
    if (currentUser?.id === id) {
      return { error: 'Bạn không thể tự xóa tài khoản của chính mình!' }
    }

    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return { error: 'Người dùng không tồn tại hoặc đã bị xóa!' }
    }

    await prisma.user.delete({
      where: { id },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi xóa người dùng!' }
  }
}

/**
 * Server Action: Đặt lại mật khẩu người dùng
 */
export async function resetPasswordAction(id: string, password: string): Promise<ActionResponse> {
  try {
    const authError = await checkAdminAuth()
    if (authError) return authError

    if (!password || password.trim() === '') {
      return { error: 'Mật khẩu mới không được để trống!' }
    }

    if (password.length < 6) {
      return { error: 'Mật khẩu mới phải từ 6 ký tự trở lên!' }
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi đặt lại mật khẩu!' }
  }
}

