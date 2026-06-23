/**
 * Dữ liệu mẫu 25 items trong tủ lạnh
 * Mix của FRESH, EXPIRING_SOON, EXPIRED
 * Đa dạng StorageLocation
 */

import { FridgeItemStatus, StorageLocation } from '../../generated/prisma/client'

// Helper để tính ngày hết hạn từ bây giờ
const getExpiryDate = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(0, 0, 0, 0)
  return date
}

export type FridgeItemSeedData = {
  id: string
  ingredientId: string
  quantity: number
  unit: string
  storageLocation: StorageLocation
  expiryDate: Date
  status: FridgeItemStatus
}

export const fridgeItems: FridgeItemSeedData[] = [
  // FREEZER - Thịt & Hải sản
  {
    id: 'f1f1f1f1-1111-1111-1111-111111111111',
    ingredientId: 'a1a1a1a1-1111-1111-1111-111111111111', // Cá hồi
    quantity: 12000,
    unit: 'g',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(15),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'f2f2f2f2-2222-2222-2222-222222222222',
    ingredientId: 'e5e5e5e5-5555-5555-5555-555555555555', // Tôm
    quantity: 18000,
    unit: 'g',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(20),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'f3f3f3f3-3333-3333-3333-333333333333',
    ingredientId: 'j0j0j0j0-0000-0000-0000-000000000000', // Thịt ba chỉ
    quantity: 24000,
    unit: 'g',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(25),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'f4f4f4f4-4444-4444-4444-444444444444',
    ingredientId: 'k1k1k1k1-1111-1111-1111-111111111112', // Thịt bò
    quantity: 15000,
    unit: 'g',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(3),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  // CHILLER
  {
    id: 'f5f5f5f5-5555-5555-5555-555555555555',
    ingredientId: 'p6p6p6p6-6666-6666-6666-666666666667', // Ức gà
    quantity: 27000,
    unit: 'g',
    storageLocation: StorageLocation.CHILLER,
    expiryDate: getExpiryDate(2),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  {
    id: 'f6f6f6f6-6666-6666-6666-666666666666',
    ingredientId: 'c3c3c3c3-3333-3333-3333-333333333333', // Trứng
    quantity: 300,
    unit: 'quả',
    storageLocation: StorageLocation.CHILLER,
    expiryDate: getExpiryDate(8),
    status: FridgeItemStatus.FRESH,
  },
  // FRIDGE_SHELF
  {
    id: 'f7f7f7f7-7777-7777-7777-777777777777',
    ingredientId: 'd4d4d4d4-4444-4444-4444-444444444444', // Sữa
    quantity: 60,
    unit: 'hộp',
    storageLocation: StorageLocation.FRIDGE_SHELF,
    expiryDate: getExpiryDate(5),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'f8f8f8f8-8888-8888-8888-888888888888',
    ingredientId: 'b2b2b2b2-2222-2222-2222-222222222222', // Rau muống
    quantity: 60,
    unit: 'bó',
    storageLocation: StorageLocation.FRIDGE_SHELF,
    expiryDate: getExpiryDate(1),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  {
    id: 'f9f9f9f9-9999-9999-9999-999999999999',
    ingredientId: 'f6f6f6f6-6666-6666-6666-666666666666', // Cà chua
    quantity: 150,
    unit: 'quả',
    storageLocation: StorageLocation.FRIDGE_SHELF,
    expiryDate: getExpiryDate(4),
    status: FridgeItemStatus.FRESH,
  },
  // VEGETABLE_DRAWER
  {
    id: 'fa-fafafa-0000-0000-0000-000000000000',
    ingredientId: 'm3m3m3m3-3333-3333-3333-333333333334', // Hành lá
    quantity: 30,
    unit: 'bó',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(6),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'fb-fbfbfb-1111-1111-1111-111111111111',
    ingredientId: 'n4n4n4n4-4444-4444-4444-444444444445', // Tỏi
    quantity: 9000,
    unit: 'g',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(-1),
    status: FridgeItemStatus.EXPIRED,
  },
  {
    id: 'fc-fcfcfc-2222-2222-2222-222222222222',
    ingredientId: 'o5o5o5o5-5555-5555-5555-555555555556', // Hành tây
    quantity: 120,
    unit: 'quả',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(10),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'fd-fdfdfd-3333-3333-3333-333333333333',
    ingredientId: 'x4x4x4x4-4444-4444-4444-444444444475', // Ớt
    quantity: 240,
    unit: 'quả',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(2),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  {
    id: 'fe-fefefe-4444-4444-4444-444444444444',
    ingredientId: 'b8b8b8b8-8888-8888-8888-888888888879', // Cà rốt
    quantity: 18000,
    unit: 'g',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(12),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: 'ff-ffffff-5555-5555-5555-555555555555',
    ingredientId: 'z6z6z6z6-6666-6666-6666-666666666677', // Đậu phụ
    quantity: 12000,
    unit: 'g',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(0),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  // DOOR_SHELF
  {
    id: '10-10101010-6666-6666-6666-666666666666',
    ingredientId: 'g7g7g7g7-7777-7777-7777-777777777777', // Nước mắm
    quantity: 30,
    unit: 'chai',
    storageLocation: StorageLocation.DOOR_SHELF,
    expiryDate: getExpiryDate(100),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '11-11111111-7777-7777-7777-777777777777',
    ingredientId: 'r8r8r8r8-8888-8888-8888-888888888869', // Dầu ăn
    quantity: 30,
    unit: 'chai',
    storageLocation: StorageLocation.DOOR_SHELF,
    expiryDate: getExpiryDate(150),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '12-12121212-8888-8888-8888-888888888888',
    ingredientId: 'd0d0d0d0-0000-0000-0000-000000000081', // Me
    quantity: 15000,
    unit: 'g',
    storageLocation: StorageLocation.DOOR_SHELF,
    expiryDate: getExpiryDate(30),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '13-13131313-9999-9999-9999-999999999999',
    ingredientId: 'c9c9c9c9-9999-9999-9999-999999999980', // Nước cốt dừa
    quantity: 30,
    unit: 'chai',
    storageLocation: StorageLocation.DOOR_SHELF,
    expiryDate: getExpiryDate(5),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '14-14141414-0000-0000-0000-000000000000',
    ingredientId: 'h8h8h8h8-8888-8888-8888-888888888888', // Nước ngọt
    quantity: 180,
    unit: 'lon',
    storageLocation: StorageLocation.DOOR_SHELF,
    expiryDate: getExpiryDate(-2),
    status: FridgeItemStatus.EXPIRED,
  },
  // PANTRY
  {
    id: '15-15151515-1111-1111-1111-111111111111',
    ingredientId: 'i9i9i9i9-9999-9999-9999-999999999999', // Gạo
    quantity: 150,
    unit: 'kg',
    storageLocation: StorageLocation.PANTRY,
    expiryDate: getExpiryDate(180),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '16-16161616-2222-2222-2222-222222222222',
    ingredientId: 'u1u1u1u1-1111-1111-1111-111111111172', // Bún
    quantity: 60,
    unit: 'gói',
    storageLocation: StorageLocation.PANTRY,
    expiryDate: getExpiryDate(90),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '17-17171717-3333-3333-3333-333333333333',
    ingredientId: 'v2v2v2v2-2222-2222-2222-222222222273', // Phở
    quantity: 30,
    unit: 'gói',
    storageLocation: StorageLocation.PANTRY,
    expiryDate: getExpiryDate(60),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '18-18181818-4444-4444-4444-444444444444',
    ingredientId: 'k7k7k7k7-7777-7777-7777-777777777788', // Miến
    quantity: 15000,
    unit: 'g',
    storageLocation: StorageLocation.PANTRY,
    expiryDate: getExpiryDate(-5),
    status: FridgeItemStatus.EXPIRED,
  },
  // More items
  {
    id: '19-19191919-5555-5555-5555-555555555555',
    ingredientId: 'g3g3g3g3-3333-3333-3333-333333333384', // Gà
    quantity: 45,
    unit: 'con',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(10),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '1a-1a1a1a1a-6666-6666-6666-666666666666',
    ingredientId: 'f2f2f2f2-2222-2222-2222-222222222283', // Xương heo
    quantity: 36000,
    unit: 'g',
    storageLocation: StorageLocation.FREEZER,
    expiryDate: getExpiryDate(28),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '1b-1b1b1b1b-7777-7777-7777-777777777777',
    ingredientId: 'a7a7a7a7-7777-7777-7777-777777777778', // Nấm
    quantity: 4500,
    unit: 'g',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(7),
    status: FridgeItemStatus.FRESH,
  },
  {
    id: '1c-1c1c1c1c-8888-8888-8888-888888888888',
    ingredientId: 'e1e1e1e1-1111-1111-1111-111111111182', // Hương quế
    quantity: 30,
    unit: 'bó',
    storageLocation: StorageLocation.VEGETABLE_DRAWER,
    expiryDate: getExpiryDate(3),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
  {
    id: '1d-1d1d1d1d-9999-9999-9999-999999999999',
    ingredientId: 'i5i5i5i5-5555-5555-5555-555555555586', // Cua
    quantity: 60,
    unit: 'con',
    storageLocation: StorageLocation.CHILLER,
    expiryDate: getExpiryDate(1),
    status: FridgeItemStatus.EXPIRING_SOON,
  },
]
