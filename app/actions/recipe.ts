'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface ActionResponse {
  success?: boolean
  error?: string
  data?: any
}

// ─── Kiểu dữ liệu cho nguyên liệu trong công thức ────────────
interface RecipeIngredientInput {
  ingredientId: string
  quantity: number
}

// ─── Kiểu dữ liệu form gửi lên ────────────────────────────────
interface RecipeFormValues {
  title: string
  thumbnail?: string
  description?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  instructions: string[]
  ingredients: RecipeIngredientInput[]
}

/**
 * Lấy danh sách tất cả công thức (kèm số nguyên liệu)
 */
export async function getRecipesAction(): Promise<ActionResponse> {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: recipes }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công thức:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi tải danh sách công thức!' }
  }
}

/**
 * Lấy chi tiết 1 công thức theo ID
 */
export async function getRecipeDetailAction(id: string): Promise<ActionResponse> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: { ingredient: { include: { category: true } } },
        },
      },
    })

    if (!recipe) {
      return { error: 'Công thức không tồn tại!' }
    }

    return { success: true, data: recipe }
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết công thức:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra!' }
  }
}

/**
 * Tạo công thức mới — Chỉ Admin
 */
export async function createRecipeAction(values: RecipeFormValues): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const {
      title,
      thumbnail,
      description,
      prepTime,
      cookTime,
      servings,
      instructions,
      ingredients,
    } = values

    if (!title || title.trim().length < 2) {
      return { error: 'Tên công thức phải có ít nhất 2 ký tự!' }
    }

    if (!instructions || instructions.filter((s) => s.trim()).length === 0) {
      return { error: 'Vui lòng thêm ít nhất 1 bước hướng dẫn!' }
    }

    if (!ingredients || ingredients.length === 0) {
      return { error: 'Vui lòng thêm ít nhất 1 nguyên liệu!' }
    }

    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        thumbnail: thumbnail || null,
        description: description || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || null,
        instructions: instructions.filter((s) => s.trim()),
        ingredients: {
          create: ingredients
            .filter((ing) => ing.ingredientId)
            .map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity || 1,
            })),
        },
      },
      include: { ingredients: true },
    })

    revalidatePath('/dashboard/recipes')
    return { success: true, data: recipe }
  } catch (error) {
    console.error('Lỗi khi tạo công thức:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi tạo công thức mới!' }
  }
}

/**
 * Cập nhật công thức — Chỉ Admin
 */
export async function updateRecipeAction(
  id: string,
  values: RecipeFormValues,
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const {
      title,
      thumbnail,
      description,
      prepTime,
      cookTime,
      servings,
      instructions,
      ingredients,
    } = values

    if (!title || title.trim().length < 2) {
      return { error: 'Tên công thức phải có ít nhất 2 ký tự!' }
    }

    const existing = await prisma.recipe.findUnique({ where: { id } })
    if (!existing) {
      return { error: 'Công thức không tồn tại hoặc đã bị xóa!' }
    }

    // Xóa nguyên liệu cũ rồi tạo lại (đơn giản nhất)
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } })

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        thumbnail: thumbnail || null,
        description: description || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || null,
        instructions: instructions.filter((s) => s.trim()),
        ingredients: {
          create: ingredients
            .filter((ing) => ing.ingredientId)
            .map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity || 1,
            })),
        },
      },
      include: { ingredients: true },
    })

    revalidatePath('/dashboard/recipes')
    revalidatePath(`/dashboard/recipes/${id}`)
    return { success: true, data: recipe }
  } catch (error) {
    console.error('Lỗi khi cập nhật công thức:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi cập nhật công thức!' }
  }
}

/**
 * Xóa công thức — Chỉ Admin
 */
export async function deleteRecipeAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const existing = await prisma.recipe.findUnique({ where: { id } })
    if (!existing) {
      return { error: 'Công thức không tồn tại hoặc đã bị xóa!' }
    }

    await prisma.recipe.delete({ where: { id } })

    revalidatePath('/dashboard/recipes')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa công thức:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi xóa công thức!' }
  }
}
