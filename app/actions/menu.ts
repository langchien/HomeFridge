'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MealTime, MenuStatus } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { getWeekEnd } from '@/lib/week-utils'

// ─── Types ────────────────────────────────────────────────────────────

export type MenuPlanWithRelations = {
  id: string
  date: Date
  mealTime: MealTime
  status: MenuStatus
  note: string | null
  recipeId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
  recipe: {
    id: string
    title: string
    thumbnail: string | null
    cookTime: number | null
    prepTime: number | null
    servings: number | null
  }
  createdBy: {
    id: string
    name: string
    username: string
  }
}

// ─── Actions ──────────────────────────────────────────────────

/**
 * Lấy tất cả MenuPlan trong tuần của weekStart.
 */
export async function getWeekMenuAction(weekStart: Date): Promise<{
  data?: MenuPlanWithRelations[]
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  // Chỉ HOMEMAKER được phép xem thực đơn
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền xem thực đơn.' }

  const weekEnd = getWeekEnd(weekStart)

  try {
    const plans = await prisma.menuPlan.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            cookTime: true,
            prepTime: true,
            servings: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: [{ date: 'asc' }, { mealTime: 'asc' }],
    })

    return { data: plans as MenuPlanWithRelations[] }
  } catch (error) {
    console.error('getWeekMenuAction error:', error)
    return { error: 'Lỗi khi tải thực đơn.' }
  }
}

/**
 * Thêm một món ăn vào thực đơn (ngày + bữa cụ thể).
 */
export async function addMenuPlanAction(payload: {
  date: string // ISO string
  mealTime: MealTime
  recipeId: string
  note?: string
}): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền thêm thực đơn.' }

  try {
    const date = new Date(payload.date)
    date.setUTCHours(0, 0, 0, 0)

    await prisma.menuPlan.create({
      data: {
        date,
        mealTime: payload.mealTime,
        recipeId: payload.recipeId,
        note: payload.note || null,
        createdById: user.id,
      },
    })

    revalidatePath('/dashboard/menu')
    return {}
  } catch (error) {
    console.error('addMenuPlanAction error:', error)
    return { error: 'Lỗi khi thêm món vào thực đơn.' }
  }
}

/**
 * Xóa một entry trong thực đơn.
 */
export async function deleteMenuPlanAction(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền xóa thực đơn.' }

  try {
    await prisma.menuPlan.delete({ where: { id } })
    revalidatePath('/dashboard/menu')
    return {}
  } catch (error) {
    console.error('deleteMenuPlanAction error:', error)
    return { error: 'Lỗi khi xóa món khỏi thực đơn.' }
  }
}

/**
 * Cập nhật trạng thái của một món trong thực đơn.
 */
export async function updateMenuStatusAction(
  id: string,
  status: MenuStatus,
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền cập nhật thực đơn.' }

  try {
    await prisma.menuPlan.update({ where: { id }, data: { status } })
    revalidatePath('/dashboard/menu')
    return {}
  } catch (error) {
    console.error('updateMenuStatusAction error:', error)
    return { error: 'Lỗi khi cập nhật trạng thái.' }
  }
}

// TODO: autoGenerateMenuAction
// Chức năng gợi ý thực đơn tự động dựa trên nguyên liệu trong tủ lạnh (FridgeItem).
// Sẽ được triển khai sau khi model FridgeItem có dữ liệu thực tế.
//
// Logic dự kiến:
// 1. Lấy danh sách FridgeItem còn hạn sử dụng (expiryDate >= today)
// 2. Lấy danh sách Recipe có ingredients khớp với FridgeItem
// 3. Tính "điểm phù hợp" cho từng Recipe (số nguyên liệu khớp / tổng nguyên liệu)
// 4. Sắp xếp theo điểm giảm dần, gợi ý top 7 recipe cho 7 ngày trong tuần
// 5. Tự động tạo MenuPlan entries cho tuần hiện tại (nếu chưa có)
//
// export async function autoGenerateMenuAction(weekStart: Date): Promise<{
//   suggestions?: { date: Date; mealTime: MealTime; recipe: Recipe }[]
//   error?: string
// }> {
//   // ... implementation pending FridgeItem model
// }
