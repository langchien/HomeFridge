import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { Role } from '../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { categories } from './data/categories'
import { items } from './data/items'
import { recipes } from './data/recipes'
import { users } from './data/users'

async function main() {
  console.log('🔄 1. Bắt đầu dọn dẹp dữ liệu cũ trong Database...')
  await prisma.recipeIngredient.deleteMany() // Xóa liên kết trước để tránh lỗi FK
  await prisma.recipe.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Đã dọn dẹp xong dữ liệu cũ.')

  console.log('\n🔄 2. Đang khởi tạo các thể loại thực phẩm mẫu...')
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        icon: cat.icon,
        description: cat.description,
      },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
      },
    })
    console.log(`🥦 Đã nạp thể loại: ${cat.name} (UUID: ${cat.id})`)
  }
  console.log('✅ Đã khởi tạo các thể loại thành công.')

  console.log('\n🔄 3. Đang khởi tạo các tài khoản người dùng...')
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await prisma.user.create({
      data: {
        username: user.username,
        password: hashedPassword,
        name: user.name,
        role: user.role as Role,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
    console.log(`👤 Đã tạo tài khoản: "${user.username}" (Vai trò: ${user.role})`)
  }
  console.log('✅ Đã khởi tạo tài khoản người dùng thành công.')

  console.log('\n🔄 4. Đang nạp danh sách các nguyên liệu mẫu...')
  let ingredientImportCount = 0
  for (const item of items) {
    await prisma.ingredient.create({
      data: {
        id: item.id,
        name: item.name,
        image: item.image,
        categoryId: item.categoryId,
        unit: item.unit,
        storageInstructions: item.storageInstructions,
      },
    })
    console.log(`🍎 Đã nạp nguyên liệu: ${item.name}`)
    ingredientImportCount++
  }
  console.log(`🎉 Đã nạp thành công ${ingredientImportCount} nguyên liệu mẫu.`)

  console.log('\n🔄 5. Đang nạp 20 công thức nấu ăn mẫu...')
  let recipeImportCount = 0
  for (const recipe of recipes) {
    const { ingredients, ...recipeData } = recipe

    await prisma.recipe.create({
      data: {
        id: recipeData.id,
        title: recipeData.title,
        thumbnail: recipeData.thumbnail,
        description: recipeData.description,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        instructions: recipeData.instructions,
        ingredients: {
          create: ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        },
      },
    })
    console.log(`🍳 Đã nạp công thức: ${recipeData.title}`)
    recipeImportCount++
  }
  console.log(`🎉 Đã nạp thành công ${recipeImportCount} công thức nấu ăn mẫu.`)

  console.log('\n======================================================')
  console.log('🎉 QUÁ TRÌNH SEED VÀ IMPORT DỮ LIỆU HOÀN TẤT THÀNH CÔNG!')
  console.log('======================================================')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi xảy ra trong quá trình seed dữ liệu:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
