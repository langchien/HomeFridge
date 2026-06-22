'use server'

import { FridgeItemStatus, StorageLocation } from '@/generated/prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────

export type FridgeItemWithIngredient = {
  id: string
  ingredientId: string
  quantity: number
  unit: string
  storageLocation: StorageLocation
  expiryDate: Date
  status: FridgeItemStatus
  addedAt: Date
  updatedAt: Date
  ingredient: {
    id: string
    name: string
    image: string | null
    categoryId: string
  }
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Tính toán trạng thái dựa trên ngày hết hạn
 */
function calculateStatus(expiryDate: Date): FridgeItemStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return FridgeItemStatus.EXPIRED
  if (daysUntilExpiry <= 3) return FridgeItemStatus.EXPIRING_SOON
  return FridgeItemStatus.FRESH
}

/**
 * Kiểm tra quyền HOMEMAKER, DEVICE, hoặc ADMIN
 */
async function checkFridgeAccess() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Chưa đăng nhập.')
  if (!['HOMEMAKER', 'DEVICE', 'ADMIN'].includes(user.role)) {
    throw new Error('Bạn không có quyền quản lý tủ lạnh.')
  }
  return user
}

// ─── Public Actions ───────────────────────────────────────────

/**
 * Lấy tất cả FridgeItem với thông tin nguyên liệu
 */
export async function getFridgeItemsAction(): Promise<{
  data?: FridgeItemWithIngredient[]
  error?: string
}> {
  try {
    await checkFridgeAccess()

    const items = await prisma.fridgeItem.findMany({
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            image: true,
            categoryId: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    })

    return { data: items }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/**
 * Thêm item vào tủ lạnh
 */
export async function addFridgeItemAction(
  ingredientId: string,
  quantity: number,
  unit: string,
  storageLocation: string,
  expiryDate: Date,
): Promise<{ data?: FridgeItemWithIngredient; error?: string }> {
  try {
    await checkFridgeAccess()

    // Validate input
    if (!ingredientId || quantity <= 0 || !unit || !storageLocation) {
      throw new Error('Dữ liệu không hợp lệ.')
    }

    // Check if ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { id: true, name: true },
    })
    if (!ingredient) throw new Error('Nguyên liệu không tồn tại.')

    const status = calculateStatus(expiryDate)

    const item = await prisma.fridgeItem.create({
      data: {
        ingredientId,
        quantity,
        unit,
        storageLocation: storageLocation as StorageLocation,
        expiryDate,
        status,
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            image: true,
            categoryId: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/fridge')
    return { data: item }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/**
 * Cập nhật FridgeItem
 */
export async function updateFridgeItemAction(
  fridgeItemId: string,
  quantity?: number,
  storageLocation?: string,
  expiryDate?: Date,
): Promise<{ data?: FridgeItemWithIngredient; error?: string }> {
  try {
    await checkFridgeAccess()

    if (!fridgeItemId) throw new Error('ID không hợp lệ.')

    const existingItem = await prisma.fridgeItem.findUnique({
      where: { id: fridgeItemId },
      select: { expiryDate: true },
    })
    if (!existingItem) throw new Error('Item không tồn tại.')

    const updateData: any = {}
    if (quantity !== undefined && quantity > 0) updateData.quantity = quantity
    if (storageLocation) updateData.storageLocation = storageLocation as StorageLocation
    if (expiryDate) {
      updateData.expiryDate = expiryDate
      updateData.status = calculateStatus(expiryDate)
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('Không có dữ liệu cần cập nhật.')
    }

    const item = await prisma.fridgeItem.update({
      where: { id: fridgeItemId },
      data: updateData,
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            image: true,
            categoryId: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/fridge')
    return { data: item }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/**
 * Xóa FridgeItem
 */
export async function deleteFridgeItemAction(
  fridgeItemId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await checkFridgeAccess()

    if (!fridgeItemId) throw new Error('ID không hợp lệ.')

    await prisma.fridgeItem.delete({
      where: { id: fridgeItemId },
    })

    revalidatePath('/dashboard/fridge')
    return { success: true }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/**
 * Helper: Trừ nguyên liệu từ tủ lạnh khi menu được đánh dấu DONE
 * Sử dụng bên trong menu.ts
 */
export async function deductFridgeItemsAction(
  recipeId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get recipe với các ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    })

    if (!recipe) throw new Error('Công thức không tồn tại.')

    // Với mỗi ingredient trong recipe, trừ từ fridge
    for (const recipeIng of recipe.ingredients) {
      const ingredient = recipeIng.ingredient

      // Tìm fridge item của ingredient này (chọn item sắp hết hạn nhất)
      const fridgeItem = await prisma.fridgeItem.findFirst({
        where: { ingredientId: ingredient.id },
        orderBy: { expiryDate: 'asc' },
      })

      if (fridgeItem) {
        const newQuantity = fridgeItem.quantity - recipeIng.quantity
        if (newQuantity <= 0) {
          // Xóa nếu hết
          await prisma.fridgeItem.delete({
            where: { id: fridgeItem.id },
          })
        } else {
          // Cập nhật quantity
          const newStatus = calculateStatus(fridgeItem.expiryDate)
          await prisma.fridgeItem.update({
            where: { id: fridgeItem.id },
            data: {
              quantity: newQuantity,
              status: newStatus,
            },
          })
        }
      } else {
        // Log warning: ingredient không trong tủ
        console.warn(
          `[Fridge Deduct Warning] Ingredient "${ingredient.name}" không có trong tủ lạnh. Recipe: "${recipe.title}"`,
        )
      }
    }

    revalidatePath('/dashboard/fridge')
    return { success: true }
  } catch (error) {
    console.error('Error deducting fridge items:', error)
    return { error: (error as Error).message }
  }
}

/**
 * Lấy danh sách nguyên liệu (dùng cho dropdown trong form thêm/sửa item)
 */
export async function getIngredientsAction(): Promise<{
  data?: {
    id: string
    name: string
    unit: string
    image: string | null
    category: { name: string; icon: string | null }
  }[]
  error?: string
}> {
  try {
    await checkFridgeAccess()

    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        unit: true,
        image: true,
        category: {
          select: { name: true, icon: true },
        },
      },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    })

    return { data: ingredients }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

/**
 * Lấy thống kê tủ lạnh
 */
export async function getFridgeStatsAction(): Promise<{
  data?: {
    totalItems: number
    expiringCount: number
    expiredCount: number
  }
  error?: string
}> {
  try {
    await checkFridgeAccess()

    const items = await prisma.fridgeItem.findMany({
      select: { status: true },
    })

    return {
      data: {
        totalItems: items.length,
        expiringCount: items.filter((i) => i.status === FridgeItemStatus.EXPIRING_SOON).length,
        expiredCount: items.filter((i) => i.status === FridgeItemStatus.EXPIRED).length,
      },
    }
  } catch (error) {
    return { error: (error as Error).message }
  }
}
