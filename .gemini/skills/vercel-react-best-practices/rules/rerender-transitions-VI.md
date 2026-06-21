---
title: Sử dụng Transitions cho Non-Urgent Updates
impact: TRUNG BÌNH
impactDescription: duy trì độ phản hồi UI
tags: rerender, transitions, startTransition, performance
---

## Sử dụng Transitions cho Non-Urgent Updates

Đánh dấu các cập nhật state thường xuyên, không khẩn cấp (non-urgent) là transitions để duy trì độ phản hồi của UI (UI responsiveness).

**Sai (chặn UI trên mỗi lần cuộn):**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**Đúng (cập nhật không chặn - non-blocking updates):**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```
