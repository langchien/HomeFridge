'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekEnd } from '@/lib/week-utils'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────

export type ShoppingListItemWithRelations = {
  id: string
  shoppingListId: string
  ingredientId: string
  quantity: number
  unit: string
  isBought: boolean
  isStored: boolean
  note: string | null
  addedAt: Date
  ingredient: {
    id: string
    name: string
    image: string | null
    categoryId: string
    category: {
      id: string
      name: string
      icon: string | null
    }
  }
}

export type ShoppingListWithItems = {
  id: string
  date: Date
  createdById: string
  createdAt: Date
  updatedAt: Date
  items: ShoppingListItemWithRelations[]
}

// ─── Actions ──────────────────────────────────────────────────

/**
 * Lấy danh sách ShoppingList trong tuần
 */
export async function getWeekShoppingAction(weekStart: Date): Promise<{
  data?: ShoppingListWithItems[]
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER')
    return { error: 'Bạn không có quyền xem danh sách.' }

  const weekEnd = getWeekEnd(weekStart)

  try {
    const lists = await prisma.shoppingList.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
      },
      include: {
        items: {
          include: {
            ingredient: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    return { data: lists as ShoppingListWithItems[] }
  } catch (error) {
    console.error('getWeekShoppingAction error:', error)
    return { error: 'Lỗi khi tải danh sách đi chợ.' }
  }
}

/**
 * Lấy danh sách hoặc tạo mới cho ngày truyền vào
 */
export async function getOrCreateShoppingListAction(dateStr: string): Promise<{
  data?: ShoppingListWithItems
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER') return { error: 'Bạn không có quyền.' }

  try {
    const date = new Date(dateStr)
    date.setUTCHours(0, 0, 0, 0)

    let list = await prisma.shoppingList.findFirst({
      where: { date },
      include: {
        items: {
          include: { ingredient: { include: { category: true } } },
        },
      },
    })

    if (!list) {
      list = await prisma.shoppingList.create({
        data: {
          date,
          createdById: user.id,
        },
        include: {
          items: {
            include: { ingredient: { include: { category: true } } },
          },
        },
      })
      revalidatePath('/dashboard/shopping')
    }

    return { data: list as ShoppingListWithItems }
  } catch (error) {
    console.error('getOrCreateShoppingListAction error:', error)
    return { error: 'Lỗi khi tạo danh sách mua sắm.' }
  }
}

/**
 * Thêm item vào danh sách
 */
export async function addShoppingItemAction(payload: {
  shoppingListId: string
  ingredientId: string
  quantity: number
  unit: string
  note?: string
}): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER') return { error: 'Bạn không có quyền.' }

  try {
    await prisma.shoppingListItem.create({
      data: {
        shoppingListId: payload.shoppingListId,
        ingredientId: payload.ingredientId,
        quantity: payload.quantity,
        unit: payload.unit,
        note: payload.note || null,
      },
    })

    revalidatePath('/dashboard/shopping')
    return {}
  } catch (error) {
    console.error('addShoppingItemAction error:', error)
    return { error: 'Lỗi khi thêm món cần mua.' }
  }
}

/**
 * Cập nhật trạng thái item (đã mua / chưa mua)
 */
export async function toggleShoppingItemStatusAction(
  itemId: string,
  isBought: boolean,
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER') return { error: 'Bạn không có quyền.' }

  try {
    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { isBought },
    })

    revalidatePath('/dashboard/shopping')
    return {}
  } catch (error) {
    console.error('toggleShoppingItemStatusAction error:', error)
    return { error: 'Lỗi khi cập nhật trạng thái.' }
  }
}

/**
 * Xóa item
 */
export async function removeShoppingItemAction(itemId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER') return { error: 'Bạn không có quyền.' }

  try {
    await prisma.shoppingListItem.delete({
      where: { id: itemId },
    })

    revalidatePath('/dashboard/shopping')
    return {}
  } catch (error) {
    console.error('removeShoppingItemAction error:', error)
    return { error: 'Lỗi khi xóa món cần mua.' }
  }
}

/**
 * Helper: Tính trạng thái của item dựa trên hạn sử dụng
 */
function calculateStatus(expiryDate: Date): 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'EXPIRED'
  if (daysUntilExpiry <= 3) return 'EXPIRING_SOON'
  return 'FRESH'
}

/**
 * Cất nhiều nguyên liệu vào tủ lạnh cùng lúc
 */
export async function storeItemsToFridgeAction(
  items: Array<{
    id: string
    ingredientId: string
    quantity: number
    unit: string
    storageLocation: string
    expiryDate: Date
  }>,
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER' && user.role !== 'MEMBER') return { error: 'Bạn không có quyền.' }

  try {
    // Chạy trong transaction để đảm bảo toàn vẹn dữ liệu
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const status = calculateStatus(item.expiryDate)

        // 1. Tạo FridgeItem
        await tx.fridgeItem.create({
          data: {
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            storageLocation: item.storageLocation as any,
            expiryDate: item.expiryDate,
            status: status,
          },
        })

        // 2. Đánh dấu ShoppingListItem là đã cất
        await tx.shoppingListItem.update({
          where: { id: item.id },
          data: { isStored: true },
        })
      }
    })

    revalidatePath('/dashboard/shopping')
    revalidatePath('/dashboard/fridge')
    return {}
  } catch (error) {
    console.error('storeItemsToFridgeAction error:', error)
    return { error: 'Lỗi khi cất nguyên liệu vào tủ lạnh.' }
  }
}
