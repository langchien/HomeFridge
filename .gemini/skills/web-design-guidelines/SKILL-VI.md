---
name: web-design-guidelines
description: Kiểm tra code UI theo Web Interface Guidelines. Sử dụng khi được yêu cầu "review UI", "kiểm tra accessibility", "audit thiết kế", "review UX", hoặc "kiểm tra trang web theo best practices".
argument-hint: <file-hoặc-pattern>
metadata:
  author: vercel
  version: '1.0.0'
---

# Hướng Dẫn Giao Diện Web

Kiểm tra các file theo Web Interface Guidelines.

## Cách Hoạt Động

1. Lấy các hướng dẫn mới nhất từ URL nguồn bên dưới
2. Đọc các file được chỉ định (hoặc yêu cầu người dùng cung cấp file/pattern)
3. Kiểm tra theo tất cả các quy tắc trong hướng dẫn đã lấy
4. Xuất kết quả theo định dạng ngắn gọn `file:line`

## Nguồn Hướng Dẫn

Lấy hướng dẫn mới trước mỗi lần review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Sử dụng WebFetch để lấy các quy tắc mới nhất. Nội dung được lấy chứa tất cả các quy tắc và hướng dẫn định dạng output.

## Cách Sử Dụng

Khi người dùng cung cấp file hoặc pattern:

1. Lấy hướng dẫn từ URL nguồn ở trên
2. Đọc các file được chỉ định
3. Áp dụng tất cả các quy tắc từ hướng dẫn đã lấy
4. Xuất kết quả theo định dạng được chỉ định trong hướng dẫn

Nếu không có file nào được chỉ định, hỏi người dùng muốn review file nào.
