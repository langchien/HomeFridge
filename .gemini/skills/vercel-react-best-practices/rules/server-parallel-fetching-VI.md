---
title: Parallel Data Fetching với Component Composition
impact: NGHIÊM TRỌNG
impactDescription: loại bỏ server-side waterfalls
tags: server, rsc, parallel-fetching, composition
---

## Parallel Data Fetching với Component Composition

React Server Components thực thi tuần tự trong một cây (tree). Tái cấu trúc với composition để song song hóa việc fetching dữ liệu.

**Sai (Sidebar đợi fetch của Page hoàn thành):**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**Đúng (cả hai fetch đồng thời):**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

**Thay thế với children prop:**

```tsx
async function Layout({ children }: { children: ReactNode }) {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      {children}
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <Layout>
      <Sidebar />
    </Layout>
  )
}
```
