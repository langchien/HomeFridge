---
title: Giảm thiểu Serialization tại RSC Boundaries
impact: CAO
impactDescription: giảm kích thước truyền dữ liệu
tags: server, rsc, serialization, props
---

## Giảm thiểu Serialization tại RSC Boundaries

Ranh giới React Server/Client serialize tất cả các thuộc tính object thành chuỗi và nhúng chúng vào phản hồi HTML và các yêu cầu RSC tiếp theo. Dữ liệu được serialize này tác động trực tiếp đến dung lượng trang (page weight) và thời gian tải, vì vậy **kích thước rất quan trọng**. Chỉ truyền các trường mà client thực sự sử dụng.

**Sai (serializes tất cả 50 trường):**

```tsx
async function Page() {
  const user = await fetchUser() // 50 trường
  return <Profile user={user} />
}

;('use client')
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div> // sử dụng 1 trường
}
```

**Đúng (serializes chỉ 1 trường):**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

;('use client')
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```
