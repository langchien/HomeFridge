import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { Role } from '../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { categories } from './data/categories'
import { fridgeItems } from './data/fridgeItems'
import { items } from './data/items'
import { recipes } from './data/recipes'
import { users } from './data/users'

async function main() {
  console.log('🔄 1. Bắt đầu dọn dẹp dữ liệu cũ trong Database...')
  await prisma.shoppingListItem.deleteMany()
  await prisma.shoppingList.deleteMany()
  await prisma.menuPlan.deleteMany()
  await prisma.fridgeItem.deleteMany() // Xóa tủ lạnh trước
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

  console.log('\n🔄 6. Đang nạp dữ liệu tủ lạnh mẫu...')
  let fridgeImportCount = 0
  for (const fridgeItem of fridgeItems) {
    await prisma.fridgeItem.create({
      data: {
        id: fridgeItem.id,
        ingredientId: fridgeItem.ingredientId,
        quantity: fridgeItem.quantity,
        unit: fridgeItem.unit,
        storageLocation: fridgeItem.storageLocation,
        expiryDate: fridgeItem.expiryDate,
        status: fridgeItem.status,
      },
    })
    console.log(
      `❄️  Đã thêm vào tủ lạnh: ${fridgeItem.quantity}${fridgeItem.unit} (Hết hạn: ${fridgeItem.expiryDate.toLocaleDateString('vi-VN')})`,
    )
    fridgeImportCount++
  }
  console.log(`🎉 Đã nạp thành công ${fridgeImportCount} items vào tủ lạnh mẫu.`)

  console.log('\n🔄 7. Đang nạp dữ liệu Thực đơn mẫu...')
  const homemaker = await prisma.user.findFirst({ where: { role: 'HOMEMAKER' } })
  if (homemaker) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.menuPlan.createMany({
      data: [
        {
          date: today,
          mealTime: 'DINNER',
          recipeId: 'rec-001-0000-0000-0000-000000000001', // Phở bò
          createdById: homemaker.id,
          note: 'Ăn tối cùng cả nhà',
        },
        {
          date: new Date(today.getTime() + 86400000), // ngày mai
          mealTime: 'LUNCH',
          recipeId: 'rec-010-0000-0000-0000-000000000010', // Cơm chiên
          createdById: homemaker.id,
        },
      ],
    })
    console.log('🎉 Đã nạp thành công 2 thực đơn.')
  }

  console.log('\n🔄 8. Đang nạp dữ liệu Danh sách đi chợ mẫu...')
  if (homemaker) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const shoppingList = await prisma.shoppingList.create({
      data: {
        date: today,
        createdById: homemaker.id,
        items: {
          create: [
            {
              ingredientId: 'a1a1a1a1-1111-1111-1111-111111111111', // Cá hồi
              quantity: 2,
              unit: 'kg',
              isBought: false,
              isStored: false,
            },
            {
              ingredientId: 'p6p6p6p6-6666-6666-6666-666666666667', // Ức gà
              quantity: 1.5,
              unit: 'kg',
              isBought: true,
              isStored: false,
            },
            {
              ingredientId: 'b2b2b2b2-2222-2222-2222-222222222222', // Rau muống
              quantity: 3,
              unit: 'bó',
              isBought: false,
              isStored: false,
            },
          ],
        },
      },
    })
    console.log('🎉 Đã nạp thành công 1 danh sách đi chợ với 3 món.')
  }

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
