---
title: Sử dụng Lazy State Initialization
impact: TRUNG BÌNH
impactDescription: lãng phí tính toán trong mỗi lần render
tags: react, hooks, useState, performance, initialization
---

## Sử dụng Lazy State Initialization

Truyền một function vào `useState` cho các giá trị khởi tạo tốn kém. Nếu không có dạng function, initializer sẽ chạy trong mỗi lần render mặc dù giá trị chỉ được sử dụng một lần.

**Sai (chạy trong mỗi lần render):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() chạy trong MỌI lần render, làm chậm cả khi đã khởi tạo xong
  const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
  const [query, setQuery] = useState('')

  // Khi query thay đổi, buildSearchIndex chạy lại một cách không cần thiết
  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse chạy trong mỗi lần render
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings') || '{}'))

  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

**Đúng (chỉ chạy một lần):**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  // buildSearchIndex() CHỈ chạy trong lần render đầu tiên
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')

  return <SearchResults index={searchIndex} query={query} />
}

function UserProfile() {
  // JSON.parse chỉ chạy trong lần render đầu tiên
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : {}
  })

  return <SettingsForm settings={settings} onChange={setSettings} />
}
```

Sử dụng lazy initialization khi tính toán các giá trị khởi tạo từ localStorage/sessionStorage, xây dựng cấu trúc dữ liệu (indexes, maps), đọc từ DOM, hoặc thực hiện các biến đổi nặng.

Đối với các primitive đơn giản (`useState(0)`), tham chiếu trực tiếp (`useState(props.value)`), hoặc literals rẻ (`useState({})`), dạng function là không cần thiết.
