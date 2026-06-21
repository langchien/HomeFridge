---
title: Sử dụng Vòng lặp cho Min/Max thay vì Sort
impact: THẤP
impactDescription: O(n) thay vì O(n log n)
tags: javascript, arrays, performance, sorting, algorithms
---

## Sử dụng Vòng lặp cho Min/Max thay vì Sort

Tìm phần tử nhỏ nhất hoặc lớn nhất chỉ yêu cầu một lần duyệt qua mảng. Sắp xếp là lãng phí và chậm hơn.

**Sai (O(n log n) - sắp xếp để tìm mới nhất):**

```typescript
interface Project {
  id: string
  name: string
  updatedAt: number
}

function getLatestProject(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
  return sorted[0]
}
```

Sắp xếp toàn bộ mảng chỉ để tìm giá trị lớn nhất.

**Sai (O(n log n) - sắp xếp cho cũ nhất và mới nhất):**

```typescript
function getOldestAndNewest(projects: Project[]) {
  const sorted = [...projects].sort((a, b) => a.updatedAt - b.updatedAt)
  return { oldest: sorted[0], newest: sorted[sorted.length - 1] }
}
```

Vẫn sắp xếp không cần thiết khi chỉ cần min/max.

**Đúng (O(n) - vòng lặp đơn):**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null

  let latest = projects[0]

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }

  return latest
}

function getOldestAndNewest(projects: Project[]) {
  if (projects.length === 0) return { oldest: null, newest: null }

  let oldest = projects[0]
  let newest = projects[0]

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt < oldest.updatedAt) oldest = projects[i]
    if (projects[i].updatedAt > newest.updatedAt) newest = projects[i]
  }

  return { oldest, newest }
}
```

Duyệt một lần qua mảng, không copy, không sắp xếp.

**Thay thế (Math.min/Math.max cho mảng nhỏ):**

```typescript
const numbers = [5, 2, 8, 1, 9]
const min = Math.min(...numbers)
const max = Math.max(...numbers)
```

Cách này hoạt động cho mảng nhỏ nhưng có thể chậm hơn đối với mảng rất lớn do hạn chế của spread operator. Hãy sử dụng cách tiếp cận vòng lặp để đảm bảo độ tin cậy.
