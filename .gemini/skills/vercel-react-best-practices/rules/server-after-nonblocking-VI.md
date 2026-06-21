---
title: Sử dụng after() cho các tác vụ Non-Blocking
impact: TRUNG BÌNH
impactDescription: thời gian phản hồi nhanh hơn
tags: server, async, logging, analytics, side-effects
---

## Sử dụng after() cho các tác vụ Non-Blocking

Sử dụng `after()` của Next.js để lên lịch cho công việc cần thực thi sau khi phản hồi (response) được gửi đi. Điều này ngăn việc logging, analytics, và các side effects khác chặn phản hồi.

**Sai (chặn phản hồi):**

```tsx
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Thực hiện mutation
  await updateDatabase(request)

  // Logging chặn phản hồi
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })

  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

**Đúng (non-blocking):**

```tsx
import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { logUserAction } from '@/app/utils'

export async function POST(request: Request) {
  // Thực hiện mutation
  await updateDatabase(request)

  // Log sau khi phản hồi được gửi
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    const sessionCookie = (await cookies()).get('session-id')?.value || 'anonymous'

    logUserAction({ sessionCookie, userAgent })
  })

  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

Phản hồi được gửi ngay lập tức trong khi việc logging diễn ra ở background.

**Các trường hợp sử dụng phổ biến:**

- Theo dõi Analytics
- Audit logging
- Gửi thông báo
- Invalidation cache
- Các tác vụ dọn dẹp

**Lưu ý quan trọng:**

- `after()` chạy ngay cả khi phản hồi thất bại hoặc chuyển hướng (redirects)
- Hoạt động trong Server Actions, Route Handlers, và Server Components

Tham khảo: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)
