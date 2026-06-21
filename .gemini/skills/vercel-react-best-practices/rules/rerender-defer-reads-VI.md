---
title: Trì hoãn Đọc State đến Điểm Sử dụng
impact: TRUNG BÌNH
impactDescription: tránh subscriptions không cần thiết
tags: rerender, searchParams, localStorage, optimization
---

## Trì hoãn Đọc State đến Điểm Sử dụng

Đừng subscribe vào dynamic state (searchParams, localStorage) nếu bạn chỉ đọc nó bên trong callbacks.

**Sai (subscribes vào tất cả thay đổi searchParams):**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

**Đúng (đọc theo yêu cầu, không subscription):**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```
