---
title: useLatest cho Stable Callback Refs
impact: THẤP
impactDescription: ngăn chặn effect chạy lại
tags: advanced, hooks, useLatest, refs, optimization
---

## useLatest cho Stable Callback Refs

Truy cập các giá trị mới nhất trong callback mà không cần thêm chúng vào dependency arrays. Ngăn chặn effect chạy lại trong khi tránh được stale closures.

**Triển khai:**

```typescript
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
```

**Sai (effect chạy lại mỗi khi callback thay đổi):**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])
}
```

**Đúng (effect ổn định, callback mới nhất):**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchRef = useLatest(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchRef.current(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```
