---
title: Tách ra thành Memoized Components
impact: TRUNG BÌNH
impactDescription: cho phép return sớm
tags: rerender, memo, useMemo, optimization
---

## Tách ra thành Memoized Components

Tách các công việc tốn kém thành các memoized components để cho phép return sớm trước khi tính toán.

**Sai (tính toán avatar ngay cả khi đang loading):**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**Đúng (bỏ qua tính toán khi đang loading):**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

**Lưu ý:** Nếu dự án của bạn đã bật [React Compiler](https://react.dev/learn/react-compiler), việc memoization thủ công với `memo()` và `useMemo()` là không cần thiết. Compiler tự động tối ưu hóa re-renders.
