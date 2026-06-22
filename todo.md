# Danh sách công việc (TODO)

## 1. Tính năng "Kế hoạch đi chợ" (Shopping Plan / Shopping List)
Tính năng kết nối thông minh giữa Thực đơn (Menu) và Tủ lạnh (Fridge) để nhắc nhở người dùng mua sắm.

### A. Khi "Thêm món vào thực đơn" (Tạo kế hoạch)
*File liên quan: `app/dashboard/menu/components/add-menu-dialog.tsx`*
- [ ] Dùng API kiểm tra số lượng nguyên liệu tồn trong tủ lạnh ngay khi người dùng chọn món.
- [ ] Nếu phát hiện không đủ nguyên liệu, mở một **Dialog Alert** (Popup cảnh báo).
- [ ] **Nội dung Alert**: Liệt kê chi tiết những món bị thiếu và lượng thiếu.
- [ ] **Hành động (Action)**: Cung cấp nút *"Thêm đồ còn thiếu vào Kế hoạch đi chợ"*. Nhấn vào đây hệ thống sẽ tự lên thực đơn đồng thời tạo luôn list đi chợ.

### B. Khi đánh dấu "Hoàn thành món ăn" (Cập nhật thực tế)
*File liên quan: `app/dashboard/menu/components/menu-detail-table.tsx`*
- [ ] Khi đổi trạng thái (`status = DONE`), gọi API kiểm tra trước (dry-run) xem nguyên liệu trong tủ có đủ để trừ không.
- [ ] Nếu **thiếu nguyên liệu**, không tự động trừ và cập nhật ngay. Mở **Dialog Alert**.
- [ ] **Hành động (Action)** cho người dùng chọn:
  1. *"Vẫn chấp nhận hoàn thành"*: Đồng ý trừ cạn sạch những gì còn lại trong tủ về 0 (bỏ qua phần thiếu), món ăn vẫn được đánh dấu `DONE`.
  2. *"Thêm đồ thiếu vào Kế hoạch đi chợ"*: Hủy thao tác hoàn thành hiện tại, giữ nguyên trạng thái cũ và ném các nguyên liệu đó vào danh sách mua sắm.

### C. Công việc phía Backend & Hệ thống
- [ ] Tạo Model Prisma cho bảng `ShoppingList` và `ShoppingListItem` (Tên món cần mua, số lượng, trạng thái đã mua/chưa mua).
- [ ] Tạo trang giao diện `/dashboard/shopping` dành riêng cho việc quản lý đi chợ (có checkbox đánh dấu đã nhặt vào giỏ).
- [ ] Tạo hàm helper (API) tính toán chênh lệch (diff) giữa `RecipeIngredient` và `FridgeItem`.
