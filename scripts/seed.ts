import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { Role, StorageLocation } from '../generated/prisma/client'
import { prisma } from '../lib/prisma'
import { categories } from './data/categories'
import { items } from './data/items'
import { users } from './data/users'

async function main() {
  console.log('🔄 1. Bắt đầu dọn dẹp dữ liệu cũ trong Database...')
  await prisma.fridgeItem.deleteMany()
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

  console.log('\n🔄 4. Đang nạp danh sách các thực phẩm mẫu vào tủ lạnh...')
  // Tìm tài khoản có vai trò HOMEMAKER
  const homemaker = await prisma.user.findFirst({
    where: { role: 'HOMEMAKER' },
  })

  if (!homemaker) {
    console.error('❌ Không tìm thấy tài khoản có vai trò HOMEMAKER! Không thể nạp thực phẩm mẫu.')
  } else {
    console.log(`🏠 Tài khoản HOMEMAKER đích: "${homemaker.name}" (UUID: ${homemaker.id})`)
    let itemImportCount = 0
    for (const item of items) {
      await prisma.fridgeItem.create({
        data: {
          name: item.name,
          image: item.image,
          categoryId: item.categoryId,
          location: item.location as StorageLocation,
          quantity: item.quantity,
          unit: item.unit,
          addedDate: new Date(item.addedDate),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          storageInstructions: item.storageInstructions,
          notes: item.notes,
          userId: homemaker.id,
        },
      })
      console.log(`🍎 Đã nạp thực phẩm: ${item.name} (${item.quantity} ${item.unit})`)
      itemImportCount++
    }
    console.log(`🎉 Đã nạp thành công ${itemImportCount} thực phẩm mẫu vào tủ lạnh.`)
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
