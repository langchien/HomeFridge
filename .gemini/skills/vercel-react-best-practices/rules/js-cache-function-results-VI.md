---
title: Cache Function Calls Lặp lại
impact: TRUNG BÌNH
impactDescription: tránh tính toán thừa
tags: javascript, cache, memoization, performance
---

## Cache Function Calls Lặp lại

Sử dụng Map ở cấp độ module để cache kết quả hàm khi cùng một hàm được gọi lặp lại với cùng đầu vào trong quá trình render.

**Sai (tính toán thừa):**

```typescript
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify() gọi 100+ lần cho cùng tên project
        const slug = slugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**Đúng (kết quả được cache):**

```typescript
// Cache cấp module
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // Chỉ tính toán một lần cho mỗi tên project duy nhất
        const slug = cachedSlugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**Pattern đơn giản hơn cho hàm giá trị đơn:**

```typescript
let isLoggedInCache: boolean | null = null

function isLoggedIn(): boolean {
  if (isLoggedInCache !== null) {
    return isLoggedInCache
  }

  isLoggedInCache = document.cookie.includes('auth=')
  return isLoggedInCache
}

// Xóa cache khi auth thay đổi
function onAuthChange() {
  isLoggedInCache = null
}
```

Sử dụng Map (không phải hook) để nó hoạt động ở mọi nơi: utilities, event handlers, không chỉ React components.

Tham khảo: [How we made the Vercel Dashboard twice as fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
