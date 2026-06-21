---
title: Cross-Request LRU Caching
impact: CAO
impactDescription: caches qua các requests
tags: server, cache, lru, cross-request
---

## Cross-Request LRU Caching

`React.cache()` chỉ hoạt động trong phạm vi một request. Đối với dữ liệu được chia sẻ qua các requests tuần tự (người dùng click button A rồi button B), hãy sử dụng LRU cache.

**Triển khai:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 phút
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// Request 1: DB query, kết quả được cache
// Request 2: cache hit, không query DB
```

Sử dụng khi các hành động tuần tự của người dùng gọi đến nhiều endpoints cần cùng một dữ liệu trong vòng vài giây.

**Với [Fluid Compute](https://vercel.com/docs/fluid-compute) của Vercel:** LRU caching đặc biệt hiệu quả vì nhiều concurrent requests có thể chia sẻ cùng một function instance và cache. Điều này có nghĩa là cache tồn tại qua các requests mà không cần lưu trữ bên ngoài như Redis.

**Trong serverless truyền thống:** Mỗi invocation chạy cô lập, vì vậy hãy cân nhắc Redis cho cross-process caching.

Tham khảo: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
