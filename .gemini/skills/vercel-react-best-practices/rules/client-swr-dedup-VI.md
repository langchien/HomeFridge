---
title: Sử dụng SWR để Tự động Deduplication
impact: TRUNG BÌNH-CAO
impactDescription: deduplication tự động
tags: client, swr, deduplication, data-fetching
---

## Sử dụng SWR để Tự động Deduplication

SWR cho phép deduplication request, caching, và revalidation giữa các component instances.

**Sai (không deduplication, mỗi instance đều fetch):**

```tsx
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then(setUsers)
  }, [])
}
```

**Đúng (nhiều instances chia sẻ một request):**

```tsx
import useSWR from 'swr'

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

**Cho dữ liệu immutable:**

```tsx
import { useImmutableSWR } from '@/lib/swr'

function StaticContent() {
  const { data } = useImmutableSWR('/api/config', fetcher)
}
```

**Cho mutations:**

```tsx
import { useSWRMutation } from 'swr/mutation'

function UpdateButton() {
  const { trigger } = useSWRMutation('/api/user', updateUser)
  return <button onClick={() => trigger()}>Update</button>
}
```

Tham khảo: [https://swr.vercel.app](https://swr.vercel.app)
