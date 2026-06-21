---
title: Sử dụng Set/Map cho O(1) Lookups
impact: THẤP-TRUNG BÌNH
impactDescription: O(n) xuống O(1)
tags: javascript, set, map, data-structures, performance
---

## Sử dụng Set/Map cho O(1) Lookups

Chuyển đổi mảng sang Set/Map để kiểm tra thành viên lặp lại.

**Sai (O(n) mỗi lần kiểm tra):**

```typescript
const allowedIds = ['a', 'b', 'c', ...]
items.filter(item => allowedIds.includes(item.id))
```

**Đúng (O(1) mỗi lần kiểm tra):**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```
