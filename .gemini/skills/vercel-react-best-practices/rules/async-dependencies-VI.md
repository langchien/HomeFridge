---
title: Song song hóa dựa trên phụ thuộc
impact: NGHIÊM TRỌNG
impactDescription: Cải thiện 2-10 lần
tags: async, parallelization, dependencies, better-all
---

## Song song hóa dựa trên phụ thuộc

Đối với các tác vụ có sự phụ thuộc một phần, hãy sử dụng `better-all` để tối đa hóa sự song song. Nó tự động bắt đầu mỗi tác vụ ngay tại thời điểm sớm nhất có thể.

**Sai (profile đợi config một cách không cần thiết):**

```typescript
const [user, config] = await Promise.all([fetchUser(), fetchConfig()])
const profile = await fetchProfile(user.id)
```

**Đúng (config và profile chạy song song):**

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() {
    return fetchUser()
  },
  async config() {
    return fetchConfig()
  },
  async profile() {
    return fetchProfile((await this.$.user).id)
  },
})
```

Tham khảo: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)
