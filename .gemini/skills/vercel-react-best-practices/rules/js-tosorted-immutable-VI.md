---
title: Sử dụng toSorted() Thay vì sort() để Giữ tính Bất biến
impact: TRUNG BÌNH-CAO
impactDescription: ngăn chặn lỗi mutation trong React state
tags: javascript, arrays, immutability, react, state, mutation
---

## Sử dụng toSorted() Thay vì sort() để Giữ tính Bất biến

`.sort()` làm thay đổi (mutate) mảng tại chỗ, điều này có thể gây ra lỗi với React state và props. Sử dụng `.toSorted()` để tạo một mảng đã sắp xếp mới mà không gây mutation.

**Sai (làm thay đổi mảng gốc):**

```typescript
function UserList({ users }: { users: User[] }) {
  // Làm thay đổi (mutates) mảng props users!
  const sorted = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**Đúng (tạo mảng mới):**

```typescript
function UserList({ users }: { users: User[] }) {
  // Tạo mảng đã sắp xếp mới, mảng gốc không đổi
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

**Tại sao điều này quan trọng trong React:**

1. Mutation của Props/state phá vỡ mô hình bất biến của React - React mong đợi props và state được xử lý như là read-only.
2. Gây ra lỗi stale closure - Thay đổi mảng bên trong closures (callbacks, effects) có thể dẫn đến hành vi không mong muốn.

**Hỗ trợ trình duyệt (fallback cho trình duyệt cũ):**

`.toSorted()` có sẵn trong tất cả các trình duyệt hiện đại (Chrome 110+, Safari 16+, Firefox 115+, Node.js 20+). Đối với môi trường cũ hơn, sử dụng spread operator:

```typescript
// Fallback cho trình duyệt cũ
const sorted = [...items].sort((a, b) => a.value - b.value)
```

**Các phương thức mảng bất biến khác:**

- `.toSorted()` - sắp xếp bất biến
- `.toReversed()` - đảo ngược bất biến
- `.toSpliced()` - splice bất biến
- `.with()` - thay thế phần tử bất biến
