---
title: Return Sớm từ Hàm
impact: THẤP-TRUNG BÌNH
impactDescription: tránh tính toán không cần thiết
tags: javascript, functions, optimization, early-return
---

## Return Sớm từ Hàm

Return sớm khi kết quả đã được xác định để bỏ qua các xử lý không cần thiết.

**Sai (xử lý tất cả các mục ngay cả sau khi tìm thấy câu trả lời):**

```typescript
function validateUsers(users: User[]) {
  let hasError = false
  let errorMessage = ''

  for (const user of users) {
    if (!user.email) {
      hasError = true
      errorMessage = 'Email required'
    }
    if (!user.name) {
      hasError = true
      errorMessage = 'Name required'
    }
    // Tiếp tục kiểm tra tất cả users ngay cả sau khi tìm thấy lỗi
  }

  return hasError ? { valid: false, error: errorMessage } : { valid: true }
}
```

**Đúng (trả về ngay lập tức khi gặp lỗi đầu tiên):**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) {
      return { valid: false, error: 'Email required' }
    }
    if (!user.name) {
      return { valid: false, error: 'Name required' }
    }
  }

  return { valid: true }
}
```
