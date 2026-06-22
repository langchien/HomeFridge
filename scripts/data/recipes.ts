/**
 * Dữ liệu mẫu 20 công thức nấu ăn thuần Việt
 * Mỗi công thức gồm thông tin Recipe + danh sách RecipeIngredient
 */

// Các ID nguyên liệu (tham chiếu từ items.ts và categories)
const ING = {
  // Thịt & Hải sản
  CA_HOI: 'a1a1a1a1-1111-1111-1111-111111111111',
  TOM: 'e5e5e5e5-5555-5555-5555-555555555555',
  BA_CHI_HEO: 'j0j0j0j0-0000-0000-0000-000000000000',
  THIT_BO: 'k1k1k1k1-1111-1111-1111-111111111112',
  UC_GA: 'p6p6p6p6-6666-6666-6666-666666666667',
  GA_NGUYEN_CON: 'g3g3g3g3-3333-3333-3333-333333333384',
  XUONG_HEO: 'f2f2f2f2-2222-2222-2222-222222222283',
  CUA_DONG: 'i5i5i5i5-5555-5555-5555-555555555586',
  CA_LOC: 'j6j6j6j6-6666-6666-6666-666666666687',
  // Rau củ
  RAU_MUONG: 'b2b2b2b2-2222-2222-2222-222222222222',
  CA_CHUA: 'f6f6f6f6-6666-6666-6666-666666666666',
  HANH_LA: 'm3m3m3m3-3333-3333-3333-333333333334',
  TOI: 'n4n4n4n4-4444-4444-4444-444444444445',
  HANH_TAY: 'o5o5o5o5-5555-5555-5555-555555555556',
  SUP_LO: 'q7q7q7q7-7777-7777-7777-777777777768',
  SA: 'w3w3w3w3-3333-3333-3333-333333333374',
  GUNG: 'x4x4x4x4-4444-4444-4444-444444444475',
  OT: 'y5y5y5y5-5555-5555-5555-555555555576',
  DAU_PHU: 'z6z6z6z6-6666-6666-6666-666666666677',
  NAM_DONG_CO: 'a7a7a7a7-7777-7777-7777-777777777778',
  CA_ROT: 'b8b8b8b8-8888-8888-8888-888888888879',
  BI_DO: 'h4h4h4h4-4444-4444-4444-444444444485',
  HUNG_QUE: 'e1e1e1e1-1111-1111-1111-111111111182',
  // Trứng / Sữa
  TRUNG: 'c3c3c3c3-3333-3333-3333-333333333333',
  // Gia vị
  NUOC_MAM: 'g7g7g7g7-7777-7777-7777-777777777777',
  DAU_AN: 'r8r8r8r8-8888-8888-8888-888888888869',
  MUOI: 's9s9s9s9-9999-9999-9999-999999999970',
  ME: 'd0d0d0d0-0000-0000-0000-000000000081',
  NUOC_COT_DUA: 'c9c9c9c9-9999-9999-9999-999999999980',
  // Gạo & Bột
  GAO: 'i9i9i9i9-9999-9999-9999-999999999999',
  BUN: 'u1u1u1u1-1111-1111-1111-111111111172',
  PHO: 'v2v2v2v2-2222-2222-2222-222222222273',
  MIEN: 'k7k7k7k7-7777-7777-7777-777777777788',
}

export type RecipeSeedData = {
  id: string
  title: string
  thumbnail: string
  description: string
  prepTime: number
  cookTime: number
  servings: number
  instructions: string[]
  ingredients: { ingredientId: string; quantity: number }[]
}

export const recipes: RecipeSeedData[] = [
  // ─── 1. Phở bò tái chín ───────────────────────────────────────
  {
    id: 'rec-001-0000-0000-0000-000000000001',
    title: 'Phở bò tái chín',
    thumbnail:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
    description:
      'Phở bò cổ truyền với nước dùng hầm xương trong vắt, thơm ngào ngạt mùi hồi, quế. Thịt bò tái mềm tan trong miệng.',
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    instructions: [
      'Bước 1: Chần xương heo và xương bò qua nước sôi 5 phút rồi rửa sạch để loại bỏ mùi hôi.',
      'Bước 2: Nướng gừng và hành tây trực tiếp trên lửa đến khi cháy xém nhẹ, rửa sạch.',
      'Bước 3: Cho xương vào nồi, đổ nước ngập, hầm ở lửa nhỏ trong 3 tiếng. Vớt bọt thường xuyên.',
      'Bước 4: Cho gừng, hành tây nướng, túi gia vị (hồi, quế, thảo quả) vào nồi nước hầm.',
      'Bước 5: Nêm nước mắm, muối cho vừa ăn.',
      'Bước 6: Trụng bánh phở qua nước sôi, xếp vào tô.',
      'Bước 7: Thái thịt bò mỏng, xếp lên phở. Chan nước dùng sôi vào tô.',
      'Bước 8: Rắc hành lá thái nhỏ lên trên. Dùng kèm rau sống, chanh, ớt.',
    ],
    ingredients: [
      { ingredientId: ING.PHO, quantity: 500 },
      { ingredientId: ING.THIT_BO, quantity: 300 },
      { ingredientId: ING.XUONG_HEO, quantity: 500 },
      { ingredientId: ING.HANH_TAY, quantity: 2 },
      { ingredientId: ING.GUNG, quantity: 50 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 2. Bún bò Huế ────────────────────────────────────────────
  {
    id: 'rec-002-0000-0000-0000-000000000002',
    title: 'Bún bò Huế',
    thumbnail:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop&q=80',
    description:
      'Bún bò Huế đậm đà với nước dùng cay nồng từ sả và mắm ruốc, thịt bò bắp mềm ngon đặc trưng xứ Huế.',
    prepTime: 40,
    cookTime: 120,
    servings: 4,
    instructions: [
      'Bước 1: Chần xương heo qua nước sôi, rửa sạch.',
      'Bước 2: Hầm xương trong 2 tiếng ở lửa nhỏ, vớt bọt.',
      'Bước 3: Giã sả, phi thơm với dầu ăn. Cho mắm ruốc vào xào.',
      'Bước 4: Cho hỗn hợp sả, mắm ruốc vào nồi nước dùng.',
      'Bước 5: Thịt bò bắp luộc chín, thái lát mỏng.',
      'Bước 6: Nêm muối, nước mắm, ớt tươi cho vừa miệng.',
      'Bước 7: Trụng bún, xếp vào tô cùng thịt bò. Chan nước dùng nóng lên trên.',
      'Bước 8: Thêm hành lá, rau sống dùng kèm.',
    ],
    ingredients: [
      { ingredientId: ING.BUN, quantity: 500 },
      { ingredientId: ING.THIT_BO, quantity: 400 },
      { ingredientId: ING.XUONG_HEO, quantity: 500 },
      { ingredientId: ING.SA, quantity: 5 },
      { ingredientId: ING.OT, quantity: 3 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
    ],
  },

  // ─── 3. Bún riêu cua đồng ────────────────────────────────────
  {
    id: 'rec-003-0000-0000-0000-000000000003',
    title: 'Bún riêu cua đồng',
    thumbnail:
      'https://images.unsplash.com/photo-1560963689-b5682b6440f8?w=600&auto=format&fit=crop&q=80',
    description:
      'Bún riêu truyền thống với riêu cua thơm ngon, nước dùng chua ngọt từ cà chua chín đỏ.',
    prepTime: 45,
    cookTime: 60,
    servings: 4,
    instructions: [
      'Bước 1: Giã cua lọc lấy nước. Đun nước cua đến khi riêu nổi lên, vớt riêu để riêng.',
      'Bước 2: Phi tỏi và hành lá với dầu ăn. Cho cà chua vào xào đến khi nhuyễn.',
      'Bước 3: Đổ nước cua đã lọc vào nồi cà chua, đun sôi.',
      'Bước 4: Cho riêu cua vào nồi, thêm đậu phụ chiên vàng.',
      'Bước 5: Nêm muối, nước mắm, me cho vừa ăn chua nhẹ.',
      'Bước 6: Trụng bún tươi qua nước sôi, xếp vào tô.',
      'Bước 7: Chan nước dùng nóng, xếp riêu cua lên trên.',
      'Bước 8: Rắc hành lá thái nhỏ. Dùng kèm rau sống, mắm tôm.',
    ],
    ingredients: [
      { ingredientId: ING.BUN, quantity: 500 },
      { ingredientId: ING.CUA_DONG, quantity: 500 },
      { ingredientId: ING.CA_CHUA, quantity: 4 },
      { ingredientId: ING.DAU_PHU, quantity: 2 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.ME, quantity: 30 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
    ],
  },

  // ─── 4. Canh chua cá lóc ──────────────────────────────────────
  {
    id: 'rec-004-0000-0000-0000-000000000004',
    title: 'Canh chua cá lóc',
    thumbnail:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    description:
      'Canh chua Nam Bộ đặc trưng với cá lóc tươi ngon, vị chua từ me, ngọt từ cà chua và thơm từ rau thơm.',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    instructions: [
      'Bước 1: Làm sạch cá lóc, chặt khúc vừa ăn, ướp với muối và nước mắm 15 phút.',
      'Bước 2: Ngâm me trong nước ấm, lọc lấy nước cốt.',
      'Bước 3: Đun sôi nước, cho nước cốt me vào.',
      'Bước 4: Cho cà chua và cá lóc vào nồi, đun sôi lại.',
      'Bước 5: Thêm dứa, bạc hà (nếu có), đậu bắp.',
      'Bước 6: Nêm nước mắm, đường, muối cho vừa miệng.',
      'Bước 7: Rắc hành lá và rau ngổ lên trên, tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.CA_LOC, quantity: 1 },
      { ingredientId: ING.CA_CHUA, quantity: 3 },
      { ingredientId: ING.ME, quantity: 50 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 5. Cá kho tộ ─────────────────────────────────────────────
  {
    id: 'rec-005-0000-0000-0000-000000000005',
    title: 'Cá kho tộ',
    thumbnail:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
    description:
      'Cá kho tộ sệt sánh với nước màu caramel đậm đà, thấm đẫm nước mắm và tiêu. Món ăn dân dã đậm vị Việt.',
    prepTime: 15,
    cookTime: 40,
    servings: 3,
    instructions: [
      'Bước 1: Làm sạch cá lóc, thái khúc vừa ăn.',
      'Bước 2: Thắng đường đến khi có màu cánh gián để làm nước màu.',
      'Bước 3: Phi thơm tỏi, hành tím với dầu ăn.',
      'Bước 4: Cho cá vào kho với nước màu, nước mắm, tiêu.',
      'Bước 5: Đun ở lửa nhỏ khoảng 30-40 phút đến khi nước kho sệt lại.',
      'Bước 6: Rắc tiêu, hành lá lên trên khi tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.CA_LOC, quantity: 1 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
    ],
  },

  // ─── 6. Thịt kho tàu ──────────────────────────────────────────
  {
    id: 'rec-006-0000-0000-0000-000000000006',
    title: 'Thịt kho tàu (thịt kho trứng)',
    thumbnail:
      'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&auto=format&fit=crop&q=80',
    description:
      'Thịt ba chỉ heo kho mềm béo cùng trứng vịt luộc trong nước dừa thơm ngọt, màu vàng óng đặc trưng ngày Tết.',
    prepTime: 20,
    cookTime: 60,
    servings: 4,
    instructions: [
      'Bước 1: Luộc trứng chín, bóc vỏ.',
      'Bước 2: Thái thịt ba chỉ thành miếng vuông 5x5cm. Ướp với nước mắm, đường, tiêu 20 phút.',
      'Bước 3: Thắng đường làm nước màu.',
      'Bước 4: Cho thịt vào xào với nước màu đến khi săn.',
      'Bước 5: Đổ nước dừa tươi ngập thịt, cho trứng vào.',
      'Bước 6: Kho ở lửa nhỏ khoảng 45-60 phút đến khi thịt mềm, nước sánh.',
      'Bước 7: Nêm lại cho vừa ăn. Rắc hành lá.',
    ],
    ingredients: [
      { ingredientId: ING.BA_CHI_HEO, quantity: 500 },
      { ingredientId: ING.TRUNG, quantity: 4 },
      { ingredientId: ING.NUOC_COT_DUA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
    ],
  },

  // ─── 7. Bò lúc lắc ────────────────────────────────────────────
  {
    id: 'rec-007-0000-0000-0000-000000000007',
    title: 'Bò lúc lắc',
    thumbnail:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    description:
      'Thịt bò cắt hạt lựu xào nhanh lửa lớn với tỏi bơ, giữ nguyên độ mềm và nước bên trong. Ăn kèm cơm trắng hoặc bánh mì.',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    instructions: [
      'Bước 1: Thịt bò cắt hạt lựu 3x3cm. Ướp với nước mắm, dầu hào, tiêu, tỏi băm 15 phút.',
      'Bước 2: Phi thơm tỏi với bơ ở lửa lớn.',
      'Bước 3: Cho bò vào xào nhanh, lắc đều chảo.',
      'Bước 4: Xào đến khi bò chín tái (khoảng 3-4 phút) thì tắt bếp.',
      'Bước 5: Bày lên đĩa với rau xà lách, cà chua.',
      'Bước 6: Rắc hành lá, tiêu xay lên trên.',
    ],
    ingredients: [
      { ingredientId: ING.THIT_BO, quantity: 400 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.CA_CHUA, quantity: 2 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
    ],
  },

  // ─── 8. Gà rang sả ớt ────────────────────────────────────────
  {
    id: 'rec-008-0000-0000-0000-000000000008',
    title: 'Gà rang sả ớt',
    thumbnail:
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600&auto=format&fit=crop&q=80',
    description:
      'Gà chặt miếng rang vàng giòn với sả băm, ớt tươi cay nồng. Món ăn khoái khẩu cho những người thích vị cay.',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    instructions: [
      'Bước 1: Gà chặt miếng vừa ăn. Ướp với sả băm, ớt băm, nước mắm, muối 20 phút.',
      'Bước 2: Phi sả và tỏi với dầu ăn đến vàng thơm.',
      'Bước 3: Cho gà vào rang ở lửa vừa, đảo đều.',
      'Bước 4: Rang đến khi gà vàng đều và chín hoàn toàn (khoảng 25-30 phút).',
      'Bước 5: Nêm lại, rắc thêm ớt tươi thái khoanh.',
      'Bước 6: Tắt bếp, rắc hành lá, tiêu lên trên.',
    ],
    ingredients: [
      { ingredientId: ING.GA_NGUYEN_CON, quantity: 1 },
      { ingredientId: ING.SA, quantity: 5 },
      { ingredientId: ING.OT, quantity: 4 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
    ],
  },

  // ─── 9. Đậu hũ sốt cà chua ───────────────────────────────────
  {
    id: 'rec-009-0000-0000-0000-000000000009',
    title: 'Đậu hũ sốt cà chua',
    thumbnail:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    description:
      'Đậu phụ chiên vàng giòn sốt với cà chua chín, hành lá và nước mắm. Món chay đơn giản, ngon miệng.',
    prepTime: 10,
    cookTime: 20,
    servings: 3,
    instructions: [
      'Bước 1: Đậu phụ cắt miếng vuông, thấm khô rồi chiên vàng đều các mặt.',
      'Bước 2: Phi tỏi thơm với dầu ăn.',
      'Bước 3: Cà chua chặt nhỏ, cho vào xào đến khi nhuyễn thành sốt.',
      'Bước 4: Cho đậu phụ chiên vào đảo nhẹ với sốt cà chua.',
      'Bước 5: Nêm nước mắm, muối, đường cho vừa ăn.',
      'Bước 6: Rắc hành lá thái nhỏ lên trên, tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.DAU_PHU, quantity: 3 },
      { ingredientId: ING.CA_CHUA, quantity: 4 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
    ],
  },

  // ─── 10. Cơm chiên dương châu ─────────────────────────────────
  {
    id: 'rec-010-0000-0000-0000-000000000010',
    title: 'Cơm chiên dương châu',
    thumbnail:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    description:
      'Cơm chiên giòn với trứng, tôm, cà rốt và hành lá. Món ăn nhanh ngon cho bữa sáng hoặc bữa tối.',
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    instructions: [
      'Bước 1: Cơm nguội để sẵn (nên dùng cơm để qua đêm sẽ chiên giòn hơn).',
      'Bước 2: Tôm bóc vỏ, thái nhỏ. Cà rốt thái hạt lựu nhỏ.',
      'Bước 3: Đập trứng vào tô, đánh đều.',
      'Bước 4: Phi tỏi với dầu ăn ở lửa lớn. Cho tôm vào xào chín.',
      'Bước 5: Đẩy tôm sang một bên, đổ trứng vào炒 scramble nhanh tay.',
      'Bước 6: Cho cơm vào, đảo liên tục ở lửa lớn.',
      'Bước 7: Thêm cà rốt, nêm muối, nước mắm.',
      'Bước 8: Rắc hành lá thái nhỏ, tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.GAO, quantity: 300 },
      { ingredientId: ING.TOM, quantity: 150 },
      { ingredientId: ING.TRUNG, quantity: 2 },
      { ingredientId: ING.CA_ROT, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
    ],
  },

  // ─── 11. Trứng chiên cà chua ──────────────────────────────────
  {
    id: 'rec-011-0000-0000-0000-000000000011',
    title: 'Trứng chiên cà chua',
    thumbnail:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80',
    description:
      'Món ăn quen thuộc, nhanh gọn với trứng gà và cà chua chín. Đơn giản nhưng ngon cơm, dễ làm.',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    instructions: [
      'Bước 1: Đập trứng vào tô, thêm chút muối, đánh tan đều.',
      'Bước 2: Cà chua rửa sạch, thái múi cau.',
      'Bước 3: Cho dầu ăn vào chảo nóng, đổ trứng vào chiên vàng, lấy ra.',
      'Bước 4: Phi hành lá với dầu, cho cà chua vào xào.',
      'Bước 5: Cho trứng chiên vào đảo cùng cà chua.',
      'Bước 6: Nêm nước mắm, đường cho vừa ăn. Tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.TRUNG, quantity: 3 },
      { ingredientId: ING.CA_CHUA, quantity: 3 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
    ],
  },

  // ─── 12. Rau muống xào tỏi ───────────────────────────────────
  {
    id: 'rec-012-0000-0000-0000-000000000012',
    title: 'Rau muống xào tỏi',
    thumbnail:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    description:
      'Rau muống xanh mướt xào tỏi phi thơm. Nhanh, đơn giản và cực kỳ phổ biến trong bữa cơm gia đình Việt.',
    prepTime: 10,
    cookTime: 8,
    servings: 3,
    instructions: [
      'Bước 1: Nhặt rau muống, rửa sạch, để ráo nước.',
      'Bước 2: Tỏi đập dập, băm nhuyễn.',
      'Bước 3: Phi tỏi với dầu ăn ở lửa lớn đến khi vàng thơm.',
      'Bước 4: Cho rau muống vào xào nhanh ở lửa lớn.',
      'Bước 5: Nêm muối, nước mắm cho vừa ăn.',
      'Bước 6: Đảo nhanh đến khi rau vừa chín tới (khoảng 3-4 phút). Tắt bếp ngay.',
    ],
    ingredients: [
      { ingredientId: ING.RAU_MUONG, quantity: 3 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 13. Súp lơ xào bò ───────────────────────────────────────
  {
    id: 'rec-013-0000-0000-0000-000000000013',
    title: 'Súp lơ xào bò',
    thumbnail:
      'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&auto=format&fit=crop&q=80',
    description:
      'Súp lơ xanh giòn ngọt kết hợp với thịt bò thái mỏng xào lửa lớn, nêm nước mắm và dầu hào đậm đà.',
    prepTime: 15,
    cookTime: 12,
    servings: 3,
    instructions: [
      'Bước 1: Thịt bò thái mỏng, ướp với nước mắm, dầu hào, tiêu, tỏi băm.',
      'Bước 2: Súp lơ tách bông nhỏ, trụng qua nước sôi 2 phút, vớt ra.',
      'Bước 3: Phi tỏi với dầu ăn ở lửa lớn.',
      'Bước 4: Cho bò vào xào nhanh khoảng 2 phút.',
      'Bước 5: Cho súp lơ vào đảo đều cùng bò.',
      'Bước 6: Nêm lại cho vừa ăn. Tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.THIT_BO, quantity: 300 },
      { ingredientId: ING.SUP_LO, quantity: 1 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
    ],
  },

  // ─── 14. Canh bí đỏ nấu tôm ──────────────────────────────────
  {
    id: 'rec-014-0000-0000-0000-000000000014',
    title: 'Canh bí đỏ nấu tôm',
    thumbnail:
      'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600&auto=format&fit=crop&q=80',
    description:
      'Canh bí đỏ bùi ngọt nấu cùng tôm tươi, thêm hành lá thơm ngon. Món canh bổ dưỡng cho cả gia đình.',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    instructions: [
      'Bước 1: Bí đỏ gọt vỏ, bỏ hạt, cắt miếng vuông khoảng 3x3cm.',
      'Bước 2: Tôm bóc vỏ, bỏ chỉ đen.',
      'Bước 3: Đun sôi nước, cho bí đỏ vào nấu đến khi mềm (khoảng 10-12 phút).',
      'Bước 4: Cho tôm vào, đun thêm 5 phút.',
      'Bước 5: Nêm nước mắm, muối cho vừa ăn.',
      'Bước 6: Rắc hành lá thái nhỏ, tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.BI_DO, quantity: 400 },
      { ingredientId: ING.TOM, quantity: 200 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 15. Cháo gà hành gừng ───────────────────────────────────
  {
    id: 'rec-015-0000-0000-0000-000000000015',
    title: 'Cháo gà hành gừng',
    thumbnail:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    description:
      'Cháo gà trắng mịn nấu từ gà ta nguyên con, thơm mùi gừng nướng. Món ăn bổ dưỡng, dễ tiêu.',
    prepTime: 15,
    cookTime: 60,
    servings: 4,
    instructions: [
      'Bước 1: Gà rửa sạch, chà muối và gừng, rửa lại.',
      'Bước 2: Luộc gà với gừng đập dập, hành lá buộc thành bó trong 30 phút.',
      'Bước 3: Vớt gà ra để nguội, xé thịt thành sợi nhỏ.',
      'Bước 4: Vo gạo, cho vào nồi nước luộc gà, khuấy đều.',
      'Bước 5: Nấu cháo ở lửa nhỏ khoảng 30 phút đến khi cháo bông mịn.',
      'Bước 6: Nêm nước mắm, muối cho vừa ăn.',
      'Bước 7: Múc cháo ra tô, xếp thịt gà lên trên. Rắc hành lá, tiêu.',
    ],
    ingredients: [
      { ingredientId: ING.GA_NGUYEN_CON, quantity: 1 },
      { ingredientId: ING.GAO, quantity: 200 },
      { ingredientId: ING.GUNG, quantity: 50 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 16. Canh rau cải thịt bằm ───────────────────────────────
  {
    id: 'rec-016-0000-0000-0000-000000000016',
    title: 'Canh rau cải thịt bằm',
    thumbnail:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    description:
      'Canh ngọt thanh từ rau cải xanh nấu cùng thịt heo bằm. Đơn giản, nhanh gọn, thích hợp bữa cơm ngày thường.',
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    instructions: [
      'Bước 1: Thịt heo bằm nhỏ, ướp với nước mắm, muối, tiêu.',
      'Bước 2: Rau cải rửa sạch, cắt khúc vừa ăn.',
      'Bước 3: Đun sôi nước.',
      'Bước 4: Vo viên thịt bằm thả vào nồi, đun đến khi thịt chín nổi lên.',
      'Bước 5: Cho rau cải vào, đun thêm 3-4 phút.',
      'Bước 6: Nêm nước mắm, muối cho vừa ăn. Rắc hành lá, tắt bếp.',
    ],
    ingredients: [
      { ingredientId: ING.BA_CHI_HEO, quantity: 200 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 17. Tôm rang muối ────────────────────────────────────────
  {
    id: 'rec-017-0000-0000-0000-000000000017',
    title: 'Tôm rang muối',
    thumbnail:
      'https://images.unsplash.com/photo-1559742811-82428ed4658e?w=600&auto=format&fit=crop&q=80',
    description: 'Tôm rang giòn thơm với muối, ớt và sả. Ăn cả vỏ được, giòn tan, đậm vị biển.',
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    instructions: [
      'Bước 1: Tôm rửa sạch, cắt râu, để nguyên vỏ.',
      'Bước 2: Sả đập dập thái nhỏ. Ớt thái khoanh.',
      'Bước 3: Phi sả với dầu ăn đến thơm.',
      'Bước 4: Cho tôm vào xào lửa lớn, đảo đều.',
      'Bước 5: Nêm muối, tiêu, một chút đường.',
      'Bước 6: Rang đến khi tôm chín đỏ và khô vừa ăn. Cho ớt vào đảo.',
      'Bước 7: Rắc hành lá thái nhỏ.',
    ],
    ingredients: [
      { ingredientId: ING.TOM, quantity: 400 },
      { ingredientId: ING.SA, quantity: 3 },
      { ingredientId: ING.OT, quantity: 3 },
      { ingredientId: ING.HANH_LA, quantity: 1 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 18. Miến gà ──────────────────────────────────────────────
  {
    id: 'rec-018-0000-0000-0000-000000000018',
    title: 'Miến gà',
    thumbnail:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop&q=80',
    description:
      'Miến dong trong vắt nấu với nước dùng gà thơm ngọt tự nhiên. Dễ tiêu, thích hợp cho người ốm hoặc trẻ nhỏ.',
    prepTime: 15,
    cookTime: 45,
    servings: 3,
    instructions: [
      'Bước 1: Luộc gà nguyên con với gừng đập dập, hành lá và muối trong 40 phút.',
      'Bước 2: Vớt gà ra, xé thịt thành sợi nhỏ.',
      'Bước 3: Ngâm miến dong trong nước ấm 15 phút đến khi mềm.',
      'Bước 4: Đun sôi lại nước luộc gà, nêm nước mắm, muối.',
      'Bước 5: Cho miến vào nấu sôi khoảng 3-5 phút.',
      'Bước 6: Múc ra tô, xếp thịt gà xé lên trên.',
      'Bước 7: Rắc hành lá, tiêu, nấm đông cô đã ngâm mềm.',
    ],
    ingredients: [
      { ingredientId: ING.GA_NGUYEN_CON, quantity: 1 },
      { ingredientId: ING.MIEN, quantity: 200 },
      { ingredientId: ING.GUNG, quantity: 30 },
      { ingredientId: ING.HANH_LA, quantity: 2 },
      { ingredientId: ING.NAM_DONG_CO, quantity: 50 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 19. Cá hồi áp chảo bơ tỏi ──────────────────────────────
  {
    id: 'rec-019-0000-0000-0000-000000000019',
    title: 'Cá hồi áp chảo bơ tỏi',
    thumbnail:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    description:
      'Phi lê cá hồi áp chảo vàng giòn ngoài mềm trong với bơ tỏi thơm ngậy. Món ăn sang trọng dễ làm tại nhà.',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    instructions: [
      'Bước 1: Phi lê cá hồi thấm khô bằng giấy bếp. Ướp muối và tiêu cả hai mặt.',
      'Bước 2: Đun chảo với dầu ăn ở lửa lớn đến khi bốc khói.',
      'Bước 3: Đặt cá vào chảo, áp chảo mặt da xuống dưới, không chạm vào cá.',
      'Bước 4: Sau 4-5 phút lật cá. Cho bơ và tỏi đập dập vào chảo.',
      'Bước 5: Dùng thìa chan bơ đang tan liên tục lên mặt cá.',
      'Bước 6: Nêm thêm chút muối, vắt chanh lên. Tắt bếp.',
      'Bước 7: Bày lên đĩa với rau sà lách, cà chua.',
    ],
    ingredients: [
      { ingredientId: ING.CA_HOI, quantity: 400 },
      { ingredientId: ING.TOI, quantity: 1 },
      { ingredientId: ING.CA_CHUA, quantity: 2 },
      { ingredientId: ING.DAU_AN, quantity: 1 },
      { ingredientId: ING.MUOI, quantity: 1 },
    ],
  },

  // ─── 20. Lẩu thái hải sản ────────────────────────────────────
  {
    id: 'rec-020-0000-0000-0000-000000000020',
    title: 'Lẩu thái hải sản',
    thumbnail:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&auto=format&fit=crop&q=80',
    description:
      'Nồi lẩu thái chua cay với tôm, cá hồi, cà chua và nấm đông cô. Nước dùng thơm mùi sả gừng đặc trưng.',
    prepTime: 25,
    cookTime: 30,
    servings: 4,
    instructions: [
      'Bước 1: Đun nước dùng từ xương heo hoặc viên gia vị lẩu thái.',
      'Bước 2: Phi sả, gừng, tỏi với dầu ăn đến thơm.',
      'Bước 3: Cho hỗn hợp gia vị vào nước dùng. Thêm cà chua và ớt.',
      'Bước 4: Nêm nước mắm, nước cốt me, đường cho vừa chua ngọt cay.',
      'Bước 5: Để nồi lẩu trên bếp nhỏ. Nhúng tôm, cá hồi, nấm theo thứ tự.',
      'Bước 6: Ăn kèm bún tươi hoặc mì.',
      'Bước 7: Rắc hành lá, rau mùi, húng quế lên nước dùng.',
    ],
    ingredients: [
      { ingredientId: ING.TOM, quantity: 300 },
      { ingredientId: ING.CA_HOI, quantity: 300 },
      { ingredientId: ING.CA_CHUA, quantity: 4 },
      { ingredientId: ING.NAM_DONG_CO, quantity: 100 },
      { ingredientId: ING.SA, quantity: 4 },
      { ingredientId: ING.GUNG, quantity: 30 },
      { ingredientId: ING.OT, quantity: 3 },
      { ingredientId: ING.ME, quantity: 40 },
      { ingredientId: ING.HUNG_QUE, quantity: 1 },
      { ingredientId: ING.BUN, quantity: 300 },
      { ingredientId: ING.NUOC_MAM, quantity: 1 },
    ],
  },
]
