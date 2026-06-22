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
 * Server Action: Thêm thực phẩm mới vào tủ lạnh
 */
export async function createFridgeItemAction(values: any): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập để thực hiện hành động này!' }
    }

    const {
      name,
      image,
      categoryId,
      location,
      quantity,
      unit,
      expiryDate,
      storageInstructions,
      notes,
      userId,
    } = values

    if (!name || !categoryId || !location || !userId) {
      return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }
    }

    const item = await prisma.fridgeItem.create({
      data: {
        name,
        image: image || null,
        categoryId,
        location,
        quantity: parseFloat(quantity) || 1,
        unit: unit || 'cái',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        storageInstructions: storageInstructions || null,
        notes: notes || null,
        userId,
      },
    })

    revalidatePath('/dashboard/fridge')
    return { success: true, data: item }
  } catch (error) {
    console.error('Lỗi khi thêm thực phẩm:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi thêm thực phẩm!' }
  }
}

/**
 * Server Action: Cập nhật thực phẩm tủ lạnh
 */
export async function updateFridgeItemAction(id: string, values: any): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập để thực hiện hành động này!' }
    }

    const {
      name,
      image,
      categoryId,
      location,
      quantity,
      unit,
      expiryDate,
      storageInstructions,
      notes,
      userId,
    } = values

    if (!name || !categoryId || !location || !userId) {
      return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' }
    }

    // Kiểm tra thực phẩm có tồn tại không
    const existingItem = await prisma.fridgeItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return { error: 'Thực phẩm không tồn tại hoặc đã bị xóa!' }
    }

    const item = await prisma.fridgeItem.update({
      where: { id },
      data: {
        name,
        image: image || null,
        categoryId,
        location,
        quantity: parseFloat(quantity) || 1,
        unit: unit || 'cái',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        storageInstructions: storageInstructions || null,
        notes: notes || null,
        userId,
      },
    })

    revalidatePath('/dashboard/fridge')
    return { success: true, data: item }
  } catch (error) {
    console.error('Lỗi khi cập nhật thực phẩm:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi cập nhật thực phẩm!' }
  }
}

/**
 * Server Action: Xóa thực phẩm khỏi tủ lạnh
 */
export async function deleteFridgeItemAction(id: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập để thực hiện hành động này!' }
    }

    // Kiểm tra thực phẩm có tồn tại không
    const existingItem = await prisma.fridgeItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return { error: 'Thực phẩm không tồn tại hoặc đã bị xóa!' }
    }

    await prisma.fridgeItem.delete({
      where: { id },
    })

    revalidatePath('/dashboard/fridge')
    return { success: true }
  } catch (error) {
    console.error('Lỗi khi xóa thực phẩm:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi xóa thực phẩm!' }
  }
}

/**
 * Server Action: Tạo nhanh danh mục mới
 */
export async function createCategoryAction(values: {
  name: string
  icon?: string
  description?: string
}): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return { error: 'Bạn cần đăng nhập để thực hiện hành động này!' }
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

    revalidatePath('/dashboard/fridge')
    return { success: true, data: category }
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error)
    return { error: 'Đã có lỗi hệ thống xảy ra khi tạo danh mục mới!' }
  }
}
