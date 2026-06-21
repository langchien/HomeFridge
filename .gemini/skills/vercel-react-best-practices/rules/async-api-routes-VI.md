---
title: Ngăn chặn chuỗi Waterfall trong API Routes
impact: NGHIÊM TRỌNG
impactDescription: Cải thiện 2-10 lần
tags: api-routes, server-actions, waterfalls, parallelization
---

## Ngăn chặn chuỗi Waterfall trong API Routes

Trong API routes và Server Actions, hãy bắt đầu các tác vụ độc lập ngay lập tức, ngay cả khi bạn chưa await chúng.

**Sai (config đợi auth, data đợi cả hai):**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**Đúng (auth và config bắt đầu ngay lập tức):**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([configPromise, fetchData(session.user.id)])
  return Response.json({ data, config })
}
```

Đối với các tác vụ có chuỗi phụ thuộc phức tạp hơn, hãy sử dụng `better-all` để tối đa hóa khả năng song song hóa tự động (xem Dependency-Based Parallelization).
