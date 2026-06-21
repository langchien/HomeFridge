---
title: Promise.all() cho các tác vụ độc lập
impact: NGHIÊM TRỌNG
impactDescription: Cải thiện 2-10 lần
tags: async, parallelization, promises, waterfalls
---

## Promise.all() cho các tác vụ độc lập

Khi các tác vụ async không có sự phụ thuộc lẫn nhau, hãy thực thi chúng đồng thời bằng cách sử dụng `Promise.all()`.

**Sai (thực thi tuần tự, 3 round trips):**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Đúng (thực thi song song, 1 round trip):**

```typescript
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()])
```
