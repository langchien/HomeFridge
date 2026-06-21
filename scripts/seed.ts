import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🔄 Bắt đầu dọn dẹp dữ liệu cũ...')
  // Xóa các user cũ để tránh trùng lặp username khi seed lại
  await prisma.user.deleteMany()
  console.log('✅ Đã dọn dẹp dữ liệu cũ.')

  console.log('🔄 Đang tạo dữ liệu seed mẫu...')

  // 1. Tạo tài khoản Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      name: 'Quản Trị Viên (Admin)',
      role: 'ADMIN',
      email: 'admin@homiefridge.local',
      phone: '0987654321',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
    },
  })
  console.log(`🔑 Đã tạo tài khoản Admin: username: "${admin.username}", password: "admin123"`)

  // 2. Tạo tài khoản Thiết bị tủ lạnh (Kiosk)
  const devicePassword = await bcrypt.hash('fridge123', 10)
  const device = await prisma.user.create({
    data: {
      username: 'device_fridge',
      password: devicePassword,
      name: 'Thiết Bị Tủ Lạnh',
      role: 'DEVICE',
      email: 'device.fridge@homiefridge.local',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=fridge',
    },
  })
  console.log(
    `📱 Đã tạo tài khoản Thiết bị: username: "${device.username}", password: "fridge123" (Session 10 năm)`,
  )

  // 3. Tạo tài khoản Thành viên thường
  const member1Password = await bcrypt.hash('an123', 10)
  const member1 = await prisma.user.create({
    data: {
      username: 'member_an',
      password: member1Password,
      name: 'Nguyễn Văn An',
      role: 'MEMBER',
      email: 'an.nguyen@homiefridge.local',
      phone: '0912345678',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=an',
    },
  })
  console.log(
    `👤 Đã tạo tài khoản Thành viên 1: username: "${member1.username}", password: "an123"`,
  )

  const member2Password = await bcrypt.hash('binh123', 10)
  const member2 = await prisma.user.create({
    data: {
      username: 'member_binh',
      password: member2Password,
      name: 'Trần Thị Bình',
      role: 'MEMBER',
      email: 'binh.tran@homiefridge.local',
      phone: '0909090909',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=binh',
    },
  })
  console.log(
    `👤 Đã tạo tài khoản Thành viên 2: username: "${member2.username}", password: "binh123"`,
  )

  console.log('🎉 Quá trình seed dữ liệu hoàn tất thành công!')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi xảy ra trong quá trình seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
