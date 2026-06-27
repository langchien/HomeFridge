'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface ActionResponse {
  success?: boolean
  error?: string
  data?: any
}

/**
 * Server Action: Lấy danh sách nguyên liệu mẫu (Dành cho các form và đề xuất)
 */
export async function getIngredientsAction(): Promise<ActionResponse> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    })
    return { success: true, data: ingredients }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nguyên liệu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi tải danh sách nguyên liệu!' }
  }
}

/**
 * Server Action: Thêm nguyên liệu mới (Chỉ dành cho ADMIN)
 */
export async function createIngredientAction(values: any): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const { name, image, categoryId, unit, storageInstructions } = values

    if (!name || !categoryId) {
      return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }
    }

    // Kiểm tra trùng tên nguyên liệu
    const existing = await prisma.ingredient.findUnique({
      where: { name },
    })

    if (existing) {
      return { error: 'Tên nguyên liệu này đã tồn tại!' }
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        image: image || null,
        categoryId,
        unit: unit || 'g',
        storageInstructions: storageInstructions || null,
      },
    })

    revalidatePath('/dashboard/ingredients')
    return { success: true, data: ingredient }
  } catch (error) {
    console.error('Lỗi khi thêm nguyên liệu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi thêm nguyên liệu!' }
  }
}

/**
 * Server Action: Cập nhật nguyên liệu (Chỉ dành cho ADMIN)
 */
export async function updateIngredientAction(id: string, values: any): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const { name, image, categoryId, unit, storageInstructions } = values

    if (!name || !categoryId) {
      return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }
    }

    // Kiểm tra nguyên liệu có tồn tại không
    const existingItem = await prisma.ingredient.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return { error: 'Nguyên liệu không tồn tại hoặc đã bị xóa!' }
    }

    // Kiểm tra trùng tên với nguyên liệu khác
    const duplicate = await prisma.ingredient.findFirst({
      where: {
        name,
        id: { not: id },
      },
    })

    if (duplicate) {
      return { error: 'Tên nguyên liệu này đã được sử dụng bởi nguyên liệu khác!' }
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        image: image || null,
        categoryId,
        unit: unit || 'g',
        storageInstructions: storageInstructions || null,
      },
    })

    revalidatePath('/dashboard/ingredients')
    return { success: true, data: ingredient }
  } catch (error) {
    console.error('Lỗi khi cập nhật nguyên liệu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi cập nhật nguyên liệu!' }
  }
}

/**
 * Server Action: Xóa nguyên liệu (Chỉ dành cho ADMIN)
 */
export async function deleteIngredientAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    // Kiểm tra nguyên liệu có tồn tại không
    const existingItem = await prisma.ingredient.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return { error: 'Nguyên liệu không tồn tại hoặc đã bị xóa!' }
    }

    await prisma.ingredient.delete({
      where: { id },
    })

    revalidatePath('/dashboard/ingredients')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa nguyên liệu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi xóa nguyên liệu!' }
  }
}

/**
 * Server Action: Tạo nhanh danh mục mới (Chỉ dành cho ADMIN)
 */
export async function createCategoryAction(values: {
  name: string
  icon?: string
  description?: string
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    const { name, icon, description } = values

    if (!name) {
      return { error: 'Tên danh mục không được để trống!' }
    }

    // Kiểm tra trùng tên danh mục
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return { error: 'Tên danh mục đã tồn tại!' }
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || null,
        description: description || null,
      },
    })

    revalidatePath('/dashboard/ingredients')
    return { success: true, data: category }
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi tạo danh mục mới!' }
  }
}

/**
 * Server Action: Xóa nhiều nguyên liệu (Chỉ dành cho ADMIN)
 */
export async function deleteIngredientsAction(ids: string[]): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Chỉ quản trị viên mới có quyền thực hiện hành động này!' }
    }

    if (!ids || ids.length === 0) {
      return { error: 'Không có nguyên liệu nào được chọn để xóa!' }
    }

    await prisma.ingredient.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    revalidatePath('/dashboard/ingredients')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa nhiều nguyên liệu:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi xóa các nguyên liệu!' }
  }
}
