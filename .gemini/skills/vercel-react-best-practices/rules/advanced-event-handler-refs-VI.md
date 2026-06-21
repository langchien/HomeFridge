---
title: Lưu Event Handlers trong Refs
impact: THẤP
impactDescription: subscriptions ổn định
tags: advanced, hooks, refs, event-handlers, optimization
---

## Lưu Event Handlers trong Refs

Lưu các callback trong refs khi sử dụng trong các effect mà không nên re-subscribe khi callback thay đổi.

**Sai (re-subscribes mỗi lần render):**

```tsx
function useWindowEvent(event: string, handler: () => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
```

**Đúng (subscription ổn định):**

```tsx
function useWindowEvent(event: string, handler: () => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = () => handlerRef.current()
    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}
```

**Thay thế: sử dụng `useEffectEvent` nếu bạn đang dùng React mới nhất:**

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: () => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

`useEffectEvent` cung cấp API sạch hơn cho cùng một pattern: nó tạo ra một tham chiếu hàm ổn định luôn gọi phiên bản mới nhất của handler.
