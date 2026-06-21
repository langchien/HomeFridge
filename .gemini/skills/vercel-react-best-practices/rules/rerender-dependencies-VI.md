---
title: Thu hẹp Effect Dependencies
impact: THẤP
impactDescription: giảm thiểu việc chạy lại effect
tags: rerender, useEffect, dependencies, optimization
---

## Thu hẹp Effect Dependencies

Chỉ định các dependencies nguyên thủy (primitive) thay vì objects để giảm thiểu việc effect chạy lại.

**Sai (chạy lại khi bất kỳ trường nào của user thay đổi):**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**Đúng (chỉ chạy lại khi id thay đổi):**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

**Đối với derived state, tính toán bên ngoài effect:**

```tsx
// Sai: chạy khi width=767, 766, 765...
useEffect(() => {
  if (width < 768) {
    enableMobileMode()
  }
}, [width])

// Đúng: chỉ chạy khi boolean chuyển đổi
const isMobile = width < 768
useEffect(() => {
  if (isMobile) {
    enableMobileMode()
  }
}, [isMobile])
```
