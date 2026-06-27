'use server'

import { MealTime, MenuStatus } from '@/generated/prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekEnd } from '@/lib/week-utils'
import { revalidatePath } from 'next/cache'

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
 * ⚡ Khi chuyển sang DONE: tự động trừ nguyên liệu khỏi tủ lạnh.
 */
export async function updateMenuStatusAction(
  id: string,
  status: MenuStatus,
): Promise<{ error?: string; deductWarning?: string; deductedItems?: string[] }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền cập nhật thực đơn.' }

  try {
    // Lấy thông tin MenuPlan hiện tại (cần recipeId để trừ nguyên liệu)
    const menuPlan = await prisma.menuPlan.findUnique({
      where: { id },
      select: { status: true, recipeId: true },
    })
    if (!menuPlan) return { error: 'Thực đơn không tồn tại.' }

    // Cập nhật status trước
    await prisma.menuPlan.update({ where: { id }, data: { status } })
    revalidatePath('/dashboard/menu')

    // ─── Xử lý đặc biệt khi chuyển sang DONE ────────────────────
    // Chỉ trừ nguyên liệu nếu status trước đó KHÔNG phải DONE
    // (tránh trừ trùng lặp nếu người dùng bấm DONE nhiều lần)
    if (status === 'DONE' && menuPlan.status !== 'DONE') {
      const deductResult = await deductFridgeIngredients(menuPlan.recipeId)
      return {
        deductWarning: deductResult.warning,
        deductedItems: deductResult.deducted,
      }
    }

    return {}
  } catch (error) {
    console.error('updateMenuStatusAction error:', error)
    return { error: 'Lỗi khi cập nhật trạng thái.' }
  }
}

/**
 * Trừ nguyên liệu của một Recipe khỏi FridgeItem.
 * Ưu tiên item sắp hết hạn nhất (FIFO theo expiryDate).
 * Trả về warning nếu có nguyên liệu không đủ trong tủ.
 */
async function deductFridgeIngredients(
  recipeId: string,
): Promise<{ warning?: string; deducted?: string[] }> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: { ingredient: { select: { id: true, name: true, unit: true } } },
      },
    },
  })
  if (!recipe) return {}

  const missingIngredients: string[] = []
  const deductedIngredients: string[] = []

  for (const ri of recipe.ingredients) {
    let needed = ri.quantity
    const startNeeded = needed

    // Lấy tất cả FridgeItem của ingredient, ưu tiên item sắp hết hạn nhất
    const fridgeItems = await prisma.fridgeItem.findMany({
      where: { ingredientId: ri.ingredientId },
      orderBy: { expiryDate: 'asc' },
    })

    if (fridgeItems.length === 0) {
      missingIngredients.push(ri.ingredient.name)
      continue
    }

    // Trừ lần lượt từng FridgeItem (FIFO theo expiryDate)
    for (const item of fridgeItems) {
      if (needed <= 0) break

      if (item.quantity <= needed) {
        // Xóa hẳn item này và tiếp tục
        needed -= item.quantity
        await prisma.fridgeItem.delete({ where: { id: item.id } })
      } else {
        // Cập nhật quantity còn lại
        await prisma.fridgeItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity - needed },
        })
        needed = 0
      }
    }

    const deductedAmount = startNeeded - needed
    if (deductedAmount > 0) {
      deductedIngredients.push(`${ri.ingredient.name} (${deductedAmount}${ri.ingredient.unit})`)
    }

    if (needed > 0) {
      // Đã trừ hết nhưng vẫn thiếu
      missingIngredients.push(`${ri.ingredient.name} (thiếu ${needed}${ri.ingredient.unit})`)
    }
  }

  revalidatePath('/dashboard/fridge')

  return {
    warning:
      missingIngredients.length > 0
        ? `Một số nguyên liệu không đủ trong tủ lạnh: ${missingIngredients.join(', ')}`
        : undefined,
    deducted: deductedIngredients.length > 0 ? deductedIngredients : undefined,
  }
}

/**
 * Kiểm tra xem có đủ nguyên liệu trong tủ lạnh để làm món ăn này không (Dry run).
 * Trả về danh sách cảnh báo nếu có nguyên liệu thiếu.
 */
export async function checkRecipeIngredientsAction(
  recipeId: string,
): Promise<{ error?: string; warning?: string; missingItems?: string[] }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền.' }

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: { ingredient: { select: { id: true, name: true, unit: true } } },
        },
      },
    })
    if (!recipe) return { error: 'Không tìm thấy công thức.' }

    const missingIngredients: string[] = []

    for (const ri of recipe.ingredients) {
      let needed = ri.quantity

      const fridgeItems = await prisma.fridgeItem.findMany({
        where: { ingredientId: ri.ingredientId },
      })

      if (fridgeItems.length === 0) {
        missingIngredients.push(ri.ingredient.name)
        continue
      }

      for (const item of fridgeItems) {
        if (needed <= 0) break
        needed -= item.quantity
      }

      if (needed > 0) {
        missingIngredients.push(`${ri.ingredient.name} (thiếu ${needed}${ri.ingredient.unit})`)
      }
    }

    return {
      missingItems: missingIngredients,
      warning:
        missingIngredients.length > 0
          ? `Một số nguyên liệu không đủ trong tủ lạnh: ${missingIngredients.join(', ')}`
          : undefined,
    }
  } catch (error) {
    console.error('checkRecipeIngredientsAction error:', error)
    return { error: 'Lỗi khi kiểm tra nguyên liệu.' }
  }
}

// ─── Auto Generate Menu ───────────────────────────────────────

export type RecipeSuggestion = {
  recipe: {
    id: string
    title: string
    thumbnail: string | null
    cookTime: number | null
    prepTime: number | null
    servings: number | null
  }
  /** Điểm phù hợp: số nguyên liệu có trong tủ / tổng nguyên liệu của recipe (0–1) */
  matchScore: number
  /** Số nguyên liệu khớp với tủ lạnh */
  matchCount: number
  /** Tổng số nguyên liệu recipe cần */
  totalIngredients: number
  /** Có nguyên liệu nào sắp hết hạn không (ưu tiên dùng) */
  hasExpiringSoon: boolean
}

/**
 * Gợi ý thực đơn tự động dựa trên nguyên liệu còn trong tủ lạnh.
 *
 * Logic:
 * 1. Lấy tất cả FridgeItem còn hạn (expiryDate >= hôm nay)
 * 2. Với mỗi Recipe, tính điểm = (số ingredients khớp với fridge) / (tổng ingredients recipe)
 * 3. Ưu tiên recipe có nguyên liệu sắp hết hạn (EXPIRING_SOON) để tránh lãng phí
 * 4. Trả về top N recipe sắp xếp theo điểm giảm dần
 */
export async function autoGenerateMenuAction(topN = 10): Promise<{
  suggestions?: RecipeSuggestion[]
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Chưa đăng nhập.' }
  if (user.role !== 'HOMEMAKER') return { error: 'Bạn không có quyền.' }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Lấy các FridgeItem còn hạn và ingredient IDs
    const fridgeItems = await prisma.fridgeItem.findMany({
      where: { expiryDate: { gte: today } },
      select: {
        ingredientId: true,
        status: true,
        expiryDate: true,
      },
    })

    // Map: ingredientId → trạng thái (để check EXPIRING_SOON)
    const fridgeIngredientMap = new Map<string, { status: string; expiryDate: Date }>()
    for (const item of fridgeItems) {
      // Nếu đã có entry cho ingredient này, giữ cái sắp hết hạn nhất
      const existing = fridgeIngredientMap.get(item.ingredientId)
      if (!existing || item.expiryDate < existing.expiryDate) {
        fridgeIngredientMap.set(item.ingredientId, {
          status: item.status,
          expiryDate: item.expiryDate,
        })
      }
    }

    const availableIngredientIds = new Set(fridgeIngredientMap.keys())

    // 2. Lấy tất cả Recipe kèm ingredients
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        thumbnail: true,
        cookTime: true,
        prepTime: true,
        servings: true,
        ingredients: {
          select: { ingredientId: true },
        },
      },
    })

    // 3. Tính điểm phù hợp cho từng Recipe
    const scored: RecipeSuggestion[] = []

    for (const recipe of recipes) {
      const total = recipe.ingredients.length
      if (total === 0) continue

      let matchCount = 0
      let hasExpiringSoon = false

      for (const ri of recipe.ingredients) {
        if (availableIngredientIds.has(ri.ingredientId)) {
          matchCount++
          const fridgeInfo = fridgeIngredientMap.get(ri.ingredientId)
          if (fridgeInfo?.status === 'EXPIRING_SOON') {
            hasExpiringSoon = true
          }
        }
      }

      // Bỏ qua recipe không có bất kỳ nguyên liệu nào trong tủ
      if (matchCount === 0) continue

      const matchScore = matchCount / total

      scored.push({
        recipe: {
          id: recipe.id,
          title: recipe.title,
          thumbnail: recipe.thumbnail,
          cookTime: recipe.cookTime,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
        },
        matchScore,
        matchCount,
        totalIngredients: total,
        hasExpiringSoon,
      })
    }

    // 4. Sắp xếp: ưu tiên có EXPIRING_SOON, sau đó theo điểm giảm dần
    scored.sort((a, b) => {
      if (a.hasExpiringSoon !== b.hasExpiringSoon) {
        return a.hasExpiringSoon ? -1 : 1
      }
      return b.matchScore - a.matchScore
    })

    return { suggestions: scored.slice(0, topN) }
  } catch (error) {
    console.error('autoGenerateMenuAction error:', error)
    return { error: 'Lỗi khi tạo gợi ý thực đơn.' }
  }
}
