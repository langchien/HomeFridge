---
title: Subscribe vào Derived State
impact: TRUNG BÌNH
impactDescription: giảm tần suất re-render
tags: rerender, derived-state, media-query, optimization
---

## Subscribe vào Derived State

Subscribe vào derived boolean state thay vì continuous values để giảm tần suất re-render.

**Sai (re-renders khi mỗi pixel thay đổi):**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // cập nhật liên tục
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'}>
}
```

**Đúng (chỉ re-renders khi boolean thay đổi):**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'}>
}
```
