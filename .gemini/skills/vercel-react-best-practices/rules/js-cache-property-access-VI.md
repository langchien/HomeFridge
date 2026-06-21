---
title: Cache Truy cập Thuộc tính trong Vòng lặp
impact: THẤP-TRUNG BÌNH
impactDescription: giảm thiểu lookups
tags: javascript, loops, optimization, caching
---

## Cache Truy cập Thuộc tính trong Vòng lặp

Cache các truy vấn thuộc tính object trong các hot paths.

**Sai (3 lookups × N lần lặp):**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**Đúng (tổng cộng 1 lookup):**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```
