---
title: Per-Request Deduplication với React.cache()
impact: TRUNG BÌNH
impactDescription: deduplicates trong phạm vi request
tags: server, cache, react-cache, deduplication
---

## Per-Request Deduplication với React.cache()

Sử dụng `React.cache()` để deduplication (loại bỏ trùng lặp) request phía server. Authentication và database queries được hưởng lợi nhiều nhất.

**Sử dụng:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id },
  })
})
```

Trong một request duy nhất, nhiều lệnh gọi đến `getCurrentUser()` chỉ thực thi query một lần.
