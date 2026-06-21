# Hướng dẫn sử dụng Seed Script

Thư mục này chứa script seed cơ sở dữ liệu mẫu để tạo tài khoản ban đầu cho dự án HomieFridge.

## 📌 Các tài khoản mặc định được tạo
Sau khi chạy script, các tài khoản sau sẽ sẵn sàng để đăng nhập:

1. **Quản Trị Viên (Admin):**
   * **Username:** `admin`
   * **Password:** `admin123`
   * **Quyền hạn:** Quản lý toàn bộ hệ thống, thêm sửa xóa dữ liệu.
2. **Thiết Bị Tủ Lạnh (Device):**
   * **Username:** `device_fridge`
   * **Password:** `fridge123`
   * **Quyền hạn:** Đăng nhập trực tiếp một lần trên máy tính bảng/kiosk đặt ở tủ lạnh. Phiên đăng nhập sẽ được duy trì vĩnh viễn (10 năm). Phục vụ thao tác nhanh tại chỗ.
3. **Thành Viên 1:**
   * **Username:** `member_an`
   * **Password:** `an123`
4. **Thành Viên 2:**
   * **Username:** `member_binh`
   * **Password:** `binh123`

---

## 🚀 Cách chạy Script

### Cách 1: Chạy trực tiếp qua `tsx` (Khuyên dùng)
Chạy lệnh sau ở thư mục gốc của dự án:
```bash
npx tsx scripts/seed.ts
```

### Cách 2: Tích hợp vào package.json (Tự động hóa)
Nếu bạn muốn dùng lệnh ngắn gọn `npm run db:seed`, hãy thêm dòng sau vào mục `"scripts"` của file [package.json](file:///p:/Nodejs/HomieFridge/package.json):
```json
"db:seed": "tsx scripts/seed.ts"
```
Sau đó chỉ cần chạy:
```bash
npm run db:seed
```

---

## ⚠️ Lưu ý quan trọng
* Script này sẽ thực hiện lệnh **`deleteMany()`** trên bảng `User` để xóa sạch các bản ghi user cũ trước khi nạp dữ liệu mới. Tránh chạy script này khi dự án đã đi vào hoạt động thực tế và có dữ liệu người dùng thật.
* Bạn có thể mở rộng file [seed.ts](file:///p:/Nodejs/HomieFridge/scripts/seed.ts) để thêm các lịch sử hoạt động, cấu hình phòng, v.v.
