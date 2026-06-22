'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { ActionResponse } from './fridge'

// ─── CRUD Công thức nấu ăn ────────────────────────────────

export interface RecipeIngredientInput {
  id?: string
  name: string
  quantity: number
  unit: string
}

export async function createRecipeAction(values: {
  name: string
  image?: string
  description?: string
  prepTime?: number
  cookTime?: number
  ingredients: RecipeIngredientInput[]
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const { name, image, description, prepTime, cookTime, ingredients } = values

    if (!name) return { error: 'Tên món ăn không được để trống!' }
    if (!ingredients || ingredients.length === 0) {
      return { error: 'Công thức phải có ít nhất 1 nguyên liệu!' }
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        image: image || null,
        description: description || null,
        prepTime: prepTime ? Number(prepTime) : null,
        cookTime: cookTime ? Number(cookTime) : null,
        ingredients: {
          create: ingredients.map((ing) => ({
            name: ing.name,
            quantity: Number(ing.quantity),
            unit: ing.unit,
          })),
        },
      },
      include: { ingredients: true },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: recipe }
  } catch (error) {
    console.error('Lỗi khi tạo công thức:', error)
    return { error: 'Đã có lỗi hệ thống khi tạo công thức!' }
  }
}

export async function updateRecipeAction(
  id: string,
  values: {
    name: string
    image?: string
    description?: string
    prepTime?: number
    cookTime?: number
    ingredients: RecipeIngredientInput[]
  },
): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const { name, image, description, prepTime, cookTime, ingredients } = values

    if (!name) return { error: 'Tên món ăn không được để trống!' }
    if (!ingredients || ingredients.length === 0) {
      return { error: 'Công thức phải có ít nhất 1 nguyên liệu!' }
    }

    // Xóa hết nguyên liệu cũ rồi tạo lại
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        name,
        image: image || null,
        description: description || null,
        prepTime: prepTime ? Number(prepTime) : null,
        cookTime: cookTime ? Number(cookTime) : null,
        ingredients: {
          deleteMany: {},
          create: ingredients.map((ing) => ({
            name: ing.name,
            quantity: Number(ing.quantity),
            unit: ing.unit,
          })),
        },
      },
      include: { ingredients: true },
    })

    revalidatePath('/dashboard/menu')
    return { success: true, data: recipe }
  } catch (error) {
    console.error('Lỗi khi cập nhật công thức:', error)
    return { error: 'Đã có lỗi hệ thống khi cập nhật công thức!' }
  }
}

export async function deleteRecipeAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'HOMEMAKER') {
      return { error: 'Chỉ người nội trợ mới có thể thực hiện hành động này!' }
    }

    const existing = await prisma.recipe.findUnique({ where: { id } })
    if (!existing) return { error: 'Công thức không tồn tại!' }

    await prisma.recipe.delete({ where: { id } })

    revalidatePath('/dashboard/menu')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa công thức:', error)
    return { error: 'Đã có lỗi hệ thống khi xóa công thức!' }
  }
}
