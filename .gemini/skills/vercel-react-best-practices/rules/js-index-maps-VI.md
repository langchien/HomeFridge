---
title: Xây dựng Index Maps cho Repeated Lookups
impact: THẤP-TRUNG BÌNH
impactDescription: 1M ops xuống 2K ops
tags: javascript, map, indexing, optimization, performance
---

## Xây dựng Index Maps cho Repeated Lookups

Nhiều lệnh gọi `.find()` bởi cùng một key nên sử dụng Map.

**Sai (O(n) mỗi lần lookup):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  return orders.map((order) => ({
    ...order,
    user: users.find((u) => u.id === order.userId),
  }))
}
```

**Đúng (O(1) mỗi lần lookup):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map((u) => [u.id, u]))

  return orders.map((order) => ({
    ...order,
    user: userById.get(order.userId),
  }))
}
```

Xây dựng map một lần (O(n)), sau đó tất cả các lookup là O(1).
Đối với 1000 orders × 1000 users: 1M ops → 2K ops.
