---
title: Hoist RegExp Creation
impact: THẤP-TRUNG BÌNH
impactDescription: tránh tạo lại không cần thiết
tags: javascript, regexp, optimization, memoization
---

## Hoist RegExp Creation

Đừng tạo RegExp bên trong render. Hoist (đưa lên) phạm vi module hoặc memoize với `useMemo()`.

**Sai (tạo RegExp mới mỗi lần render):**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**Đúng (memoize hoặc hoist):**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**Cảnh báo (global regex có mutable state):**

Global regex (`/g`) có trạng thái `lastIndex` có thể thay đổi (mutable):

```typescript
const regex = /foo/g
regex.test('foo') // true, lastIndex = 3
regex.test('foo') // false, lastIndex = 0
```
