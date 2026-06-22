'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { ActionResponse } from './ingredient'
import type { MealTime, MenuRequestStatus } from '@/generated/prisma/client'

// ─── Thành viên gửi yêu cầu món ăn ──────────────────────

export async function createMenuRequestAction(values: {
  dishName: string
  note?: string
  mealTime?: MealTime
  date?: string // ISO date string
  recipeId?: string
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập để gửi yêu cầu!' }
    }

    const { dishName, note, mealTime, date, recipeId } = values

    if (!dishName) return { error: 'Tên món không được để trống!' }

    const request = await prisma.menuRequest.create({
      data: {
        userId: currentUser.id,
        dishName,
        note: note || null,
        mealTime: mealTime || null,
        date: date ? new Date(date) : null,
        recipeId: recipeId || null,
      },
      include: { user: true, recipe: true },
    })

    revalidatePath('/member/menu')
    revalidatePath('/dashboard/menu')
    return { success: true, data: request }
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu món ăn:', error)
    return { error: 'Đã có lỗi hệ thống khi gửi yêu cầu!' }
  }
}

// ─── Nội trợ duyệt / từ chối yêu cầu ────────────────────

export async function updateMenuRequestStatusAction(
  id: string,
  status: MenuRequestStatus,
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể duyệt yêu cầu!' }
    }

    const existing = await prisma.menuRequest.findUnique({ where: { id } })
    if (!existing) return { error: 'Yêu cầu không tồn tại!' }

    const updated = await prisma.menuRequest.update({
      where: { id },
      data: { status },
      include: { user: true, recipe: true },
    })

    revalidatePath('/dashboard/menu')
    revalidatePath('/member/menu')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái yêu cầu:', error)
    return { error: 'Đã có lỗi hệ thống khi cập nhật yêu cầu!' }
  }
}

// ─── Thành viên xóa yêu cầu chưa duyệt ──────────────────

export async function deleteMenuRequestAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập!' }
    }

    const existing = await prisma.menuRequest.findUnique({ where: { id } })
    if (!existing) return { error: 'Yêu cầu không tồn tại!' }

    // Chỉ người tạo hoặc HOMEMAKER mới xóa được
    if (existing.userId !== currentUser.id && currentUser.role !== 'HOMEMAKER') {
      return { error: 'Bạn không có quyền xóa yêu cầu này!' }
    }

    if (existing.status !== 'PENDING' && currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ có thể xóa yêu cầu đang chờ duyệt!' }
    }

    await prisma.menuRequest.delete({ where: { id } })

    revalidatePath('/member/menu')
    revalidatePath('/dashboard/menu')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa yêu cầu:', error)
    return { error: 'Đã có lỗi hệ thống khi xóa yêu cầu!' }
  }
}
