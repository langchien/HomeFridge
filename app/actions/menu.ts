'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { ActionResponse } from './ingredient'
import type { MealTime, MenuStatus } from '@/generated/prisma/client'

// ─── CRUD DailyMenu ──────────────────────────────────────

export async function createDailyMenuAction(values: {
  date: string // ISO date string "YYYY-MM-DD"
  notes?: string
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const { date, notes } = values
    if (!date) return { error: 'Ngày không được để trống!' }

    // Kiểm tra đã có menu ngày đó chưa
    const existing = await prisma.dailyMenu.findUnique({
      where: { date: new Date(date) },
    })
    if (existing) {
      return { error: `Menu ngày ${date} đã tồn tại!` }
    }

    const menu = await prisma.dailyMenu.create({
      data: {
        date: new Date(date),
        notes: notes || null,
      },
      include: { items: { include: { recipe: { include: { ingredients: true } } } } },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: menu }
  } catch (error) {
    console.error('Lỗi khi tạo menu:', error)
    return { error: 'Đã có lỗi hệ thống khi tạo menu!' }
  }
}

export async function updateDailyMenuAction(
  id: string,
  values: { notes?: string },
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const menu = await prisma.dailyMenu.update({
      where: { id },
      data: { notes: values.notes ?? null },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: menu }
  } catch (error) {
    console.error('Lỗi khi cập nhật menu:', error)
    return { error: 'Đã có lỗi hệ thống khi cập nhật menu!' }
  }
}

export async function deleteDailyMenuAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    await prisma.dailyMenu.delete({ where: { id } })

    revalidatePath('/dashboard/menu')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa menu:', error)
    return { error: 'Đã có lỗi hệ thống khi xóa menu!' }
  }
}

export async function updateMenuStatusAction(
  id: string,
  status: MenuStatus,
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const menu = await prisma.dailyMenu.update({
      where: { id },
      data: { status },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: menu }
  } catch (error) {
    console.error('Lỗi khi đổi trạng thái menu:', error)
    return { error: 'Đã có lỗi hệ thống khi đổi trạng thái!' }
  }
}

// ─── Quản lý món ăn trong menu ───────────────────────────

export async function addMenuItemAction(values: {
  dailyMenuId: string
  recipeId: string
  mealTime: MealTime
  servings: number
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const { dailyMenuId, recipeId, mealTime, servings } = values
    if (!dailyMenuId || !recipeId || !mealTime) {
      return { error: 'Thiếu thông tin để thêm món vào menu!' }
    }

    const item = await prisma.dailyMenuItem.create({
      data: {
        dailyMenuId,
        recipeId,
        mealTime,
        servings: Number(servings) || 1,
      },
      include: { recipe: { include: { ingredients: true } } },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: item }
  } catch (error) {
    console.error('Lỗi khi thêm món vào menu:', error)
    return { error: 'Đã có lỗi hệ thống khi thêm món vào menu!' }
  }
}

export async function removeMenuItemAction(itemId: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    await prisma.dailyMenuItem.delete({ where: { id: itemId } })

    revalidatePath('/dashboard/menu')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa món khỏi menu:', error)
    return { error: 'Đã có lỗi hệ thống khi xóa món!' }
  }
}
