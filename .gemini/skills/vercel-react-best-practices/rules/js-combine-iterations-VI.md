---
title: Kết hợp Nhiều Vòng lặp Mảng
impact: THẤP-TRUNG BÌNH
impactDescription: giảm số lần lặp
tags: javascript, arrays, loops, performance
---

## Kết hợp Nhiều Vòng lặp Mảng

Nhiều lệnh gọi `.filter()` hoặc `.map()` sẽ lặp qua mảng nhiều lần. Hãy kết hợp thành một vòng lặp.

**Sai (3 lần lặp):**

```typescript
const admins = users.filter((u) => u.isAdmin)
const testers = users.filter((u) => u.isTester)
const inactive = users.filter((u) => !u.isActive)
```

**Đúng (1 lần lặp):**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```
