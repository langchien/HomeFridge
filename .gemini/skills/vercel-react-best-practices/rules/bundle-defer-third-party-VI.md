---
title: Trì hoãn Thư viện Bên thứ ba Không quan trọng
impact: TRUNG BÌNH
impactDescription: tải sau khi hydration
tags: bundle, third-party, analytics, defer
---

## Trì hoãn Thư viện Bên thứ ba Không quan trọng

Analytics, logging, và error tracking không ngăn chặn tương tác của người dùng. Hãy tải chúng sau khi hydration.

**Sai (chặn initial bundle):**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Đúng (tải sau khi hydration):**

```tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(() => import('@vercel/analytics/react').then((m) => m.Analytics), {
  ssr: false,
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```
