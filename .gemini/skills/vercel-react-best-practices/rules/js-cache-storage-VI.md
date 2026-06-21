---
title: Cache Storage API Calls
impact: THẤP-TRUNG BÌNH
impactDescription: giảm thiểu I/O tốn kém
tags: javascript, localStorage, storage, caching, performance
---

## Cache Storage API Calls

`localStorage`, `sessionStorage`, và `document.cookie` là đồng bộ và tốn kém. Hãy cache các lần đọc trong memory.

**Sai (đọc storage mỗi lần gọi):**

```typescript
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}
// Gọi 10 lần = 10 lần đọc storage
```

**Đúng (Map cache):**

```typescript
const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value) // giữ cache đồng bộ
}
```

Sử dụng Map (không phải hook) để nó hoạt động ở mọi nơi: utilities, event handlers, không chỉ React components.

**Cookie caching:**

```typescript
let cookieCache: Record<string, string> | null = null

function getCookie(name: string) {
  if (!cookieCache) {
    cookieCache = Object.fromEntries(document.cookie.split('; ').map((c) => c.split('=')))
  }
  return cookieCache[name]
}
```

**Quan trọng (invalidate khi thay đổi bên ngoài):**

Nếu storage có thể thay đổi từ bên ngoài (tab khác, server-set cookies), hãy invalidate cache:

```typescript
window.addEventListener('storage', (e) => {
  if (e.key) storageCache.delete(e.key)
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    storageCache.clear()
  }
})
```
