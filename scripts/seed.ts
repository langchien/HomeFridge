import 'dotenv/config'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('🔄 1. Bắt đầu dọn dẹp dữ liệu cũ trong Database...')
  await prisma.user.deleteMany()
  console.log('✅ Đã dọn dẹp xong dữ liệu cũ.')

  console.log('\n🔄 2. Đang khởi tạo các tài khoản hệ thống cốt lõi...')

  // 2.1 Khởi tạo tài khoản Admin
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
  console.log(`🔑 Đã tạo Admin: username: "${admin.username}", password: "admin123"`)

  // 2.2 Khởi tạo tài khoản Thiết bị tủ lạnh
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
  console.log(`📱 Đã tạo Thiết bị: username: "${device.username}", password: "fridge123"`)

  // 2.3 Khởi tạo các tài khoản Thành viên mẫu (Mock)
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
  console.log(`👤 Đã tạo Thành viên 1: username: "${member1.username}", password: "an123"`)

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
  console.log(`👤 Đã tạo Thành viên 2: username: "${member2.username}", password: "binh123"`)

  console.log('\n🔄 3. Bắt đầu import danh sách thành viên từ file members.json...')
  const filePath = path.join(process.cwd(), 'data/members.json')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Không tìm thấy file data/members.json! Bỏ qua bước import này.')
  } else {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    const members = JSON.parse(rawData)

    const defaultPasswordHash = await bcrypt.hash('123456', 10)
    let importCount = 0

    for (const member of members) {
      const { username, name, phone, email, role } = member

      // Đảm bảo không trùng với các tài khoản hệ thống đã tạo ở bước 2
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            ...(email ? [{ email }] : [])
          ]
        }
      })

      if (existingUser) {
        console.log(`⚠️ Bỏ qua: "${name}" (username: ${username}) đã bị trùng lắp.`)
        continue
      }

      await prisma.user.create({
        data: {
          username,
          name,
          phone: phone || null,
          email: email || null,
          role: role || 'MEMBER',
          password: defaultPasswordHash,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`
        }
      })
      console.log(`✅ Đã import thành công: "${name}" (username: ${username}) - Vai trò: ${role || 'MEMBER'}`)
      importCount++
    }
    console.log(`🎉 Đã import thêm ${importCount} tài khoản từ members.json thành công!`)
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
