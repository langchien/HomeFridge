---
title: Deduplicate Global Event Listeners
impact: THẤP
impactDescription: một listener cho N components
tags: client, swr, event-listeners, subscription
---

## Deduplicate Global Event Listeners

Sử dụng `useSWRSubscription()` để chia sẻ các global event listeners giữa các instances của component.

**Sai (N instances = N listeners):**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}
```

Khi sử dụng hook `useKeyboardShortcut` nhiều lần, mỗi instance sẽ đăng ký một listener mới.

**Đúng (N instances = 1 listener):**

```tsx
import useSWRSubscription from 'swr/subscription'

// Module-level Map để theo dõi callbacks cho mỗi key
const keyCallbacks = new Map<string, Set<() => void>>()

function useKeyboardShortcut(key: string, callback: () => void) {
  // Đăng ký callback này trong Map
  useEffect(() => {
    if (!keyCallbacks.has(key)) {
      keyCallbacks.set(key, new Set())
    }
    keyCallbacks.get(key)!.add(callback)

    return () => {
      const set = keyCallbacks.get(key)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          keyCallbacks.delete(key)
        }
      }
    }
  }, [key, callback])

  useSWRSubscription('global-keydown', () => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && keyCallbacks.has(e.key)) {
        keyCallbacks.get(e.key)!.forEach((cb) => cb())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
}

function Profile() {
  // Nhiều shortcuts sẽ chia sẻ cùng một listener
  useKeyboardShortcut('p', () => {
    /* ... */
  })
  useKeyboardShortcut('k', () => {
    /* ... */
  })
  // ...
}
```
