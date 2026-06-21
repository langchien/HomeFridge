# Hướng dẫn Áp dụng Template Giao diện (Dashboard & Tasks)

Kỹ năng này hướng dẫn AI Agent cách khai thác và tái sử dụng các file template có sẵn trong thư mục `ui-template/` để xây dựng nhanh các trang hoặc chức năng mới trong ứng dụng Next.js.

## Các Template Có Sẵn

1. **Dashboard Template** (`ui-template/dashboard/`)
   - Thích hợp cho trang tổng quan, biểu đồ phân tích và cấu trúc menu bên (sidebar).
   - Các file cốt lõi:
     - [page.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/page.tsx): Khung bố cục sử dụng `SidebarProvider` và các phân đoạn dashboard tương tác.
     - [components/app-sidebar.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/components/app-sidebar.tsx): Thanh điều hướng thu gọn sử dụng `@/components/ui/sidebar`.
     - [components/chart-area-interactive.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/components/chart-area-interactive.tsx): Biểu đồ diện tích tương tác sử dụng `recharts`.
     - [components/data-table.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/components/data-table.tsx): Bảng dữ liệu phức tạp hỗ trợ kéo thả đổi vị trí cột sử dụng `dnd-kit`.
     - Các widget bổ trợ khác: [section-cards.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/components/section-cards.tsx), [site-header.tsx](file:///p:/Nodejs/HomieFridge/ui-template/dashboard/components/site-header.tsx).

2. **Tasks Table Template** (`ui-template/tasks/`)
   - Phù hợp hoàn hảo cho danh sách công việc, sự cố, giao dịch hoặc bất kỳ dữ liệu dạng bảng nào cần lọc, phân trang, tìm kiếm và sắp xếp.
   - Các file cốt lõi:
     - [page.tsx](file:///p:/Nodejs/HomieFridge/ui-template/tasks/page.tsx): Đọc dữ liệu bất đồng bộ và khối tiêu đề trang.
     - [components/data-table.tsx](file:///p:/Nodejs/HomieFridge/ui-template/tasks/components/data-table.tsx): Tích hợp TanStack Table chính.
     - [components/columns.tsx](file:///p:/Nodejs/HomieFridge/ui-template/tasks/components/columns.tsx): Định nghĩa các cột, cách hiển thị trạng thái, badge và các nút hành động.
     - Các bộ điều khiển: [data-table-toolbar.tsx](file:///p:/Nodejs/HomieFridge/ui-template/tasks/components/data-table-toolbar.tsx) (ô tìm kiếm và bộ lọc nhanh), [data-table-pagination.tsx](file:///p:/Nodejs/HomieFridge/ui-template/tasks/components/data-table-pagination.tsx).

3. **RHF Form Template** (`ui-template/rhf-form/`)
   - Thích hợp cho việc tạo mới và tái cấu trúc các form sử dụng React Hook Form, @hookform/resolvers và Zod.
   - Các file cốt lõi:
     - [SKILL.md](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/SKILL.md): Giải thích các pattern thiết kế form, điều kiện kích hoạt, quy tắc bắt buộc và danh mục công thức.
     - [form-rhf-demo.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-demo.tsx): Form mẫu cơ bản với trường text và textarea.
     - [form-rhf-input.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-input.tsx), [form-rhf-select.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-select.tsx), [form-rhf-checkbox.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-checkbox.tsx), [form-rhf-switch.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-switch.tsx), [form-rhf-textarea.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-textarea.tsx), [form-rhf-radiogroup.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-radiogroup.tsx): Các template riêng lẻ cho từng loại input cụ thể.
     - [form-rhf-array.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-array.tsx): Quản lý danh sách động với `useFieldArray`.
     - [form-rhf-complex.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-complex.tsx): Form phức tạp kết hợp nhiều loại control (Radio, Select, Checkbox group, Switch).
     - [form-rhf-password.tsx](file:///p:/Nodejs/HomieFridge/ui-template/rhf-form/form-rhf-password.tsx): Form mật khẩu với tính năng kiểm tra độ mạnh yếu trực quan.

---

## Luồng Quy Trình Sao Chép và Tùy Biến Template

Khi người dùng yêu cầu tạo trang mới phù hợp với một trong các template này, hãy tuân theo các bước sau:

### Bước 1: Xác định Thư mục Đích
Xác định thư mục trong `app/` nơi trang mới sẽ được đặt (ví dụ: `app/admin/reports/` hoặc `app/dashboard/garbage/`).

### Bước 2: Sao chép File và Tái cấu trúc
Sao chép các file template cần thiết. Bạn có thể sao chép toàn bộ hoặc một phần:
- Nếu trang đích chỉ cần bảng dữ liệu, chỉ sao chép các file liên quan đến table từ `tasks/components/` sang `app/<target-route>/components/`.

### Bước 3: Sửa lại Đường dẫn Import
Luôn luôn viết lại các đường dẫn import dựa trên vị trí mới:
- Các UI component dùng chung phải import từ `@/components/ui/...`
- Các hook dùng chung phải import từ `@/hooks/...`
- Các hàm tiện ích phải import từ `@/lib/...`
- Các import tương đối (như `./components/user-nav` hoặc `../data/schema`) phải được kiểm tra và điều chỉnh khớp với cấu trúc thư mục mới.

### Bước 4: Tùy biến Schema & Logic Dữ liệu
Điều chỉnh các cột, bộ lọc và logic hiển thị để phù hợp với Prisma Model hoặc API dữ liệu thực tế của trang mới:
- Với Table: Sửa đổi `columns.tsx` để hiển thị các trường từ database thay vì các trường mặc định của task.
- Với Chart: Cập nhật các key, label và màu sắc trong `chartConfig` và các thẻ `Area` trong `chart-area-interactive.tsx`.
- Với Sidebar: Thêm hoặc bớt các mục điều hướng trong `app-sidebar.tsx`.

### Bước 5: Xác minh
Chạy kiểm tra kiểu dữ liệu (`npm run typecheck`) và chạy thử build (`npm run build`) để đảm bảo không phát sinh lỗi biên dịch.
