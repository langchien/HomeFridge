---
title: Trì hoãn Await cho đến khi cần thiết
impact: CAO
impactDescription: tránh chặn các đường dẫn code không sử dụng
tags: async, await, conditional, optimization
---

## Trì hoãn Await cho đến khi cần thiết

Di chuyển các thao tác `await` vào các nhánh (branch) nơi chúng thực sự được sử dụng để tránh chặn các đường dẫn code không cần chúng.

**Sai (chặn cả hai nhánh):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // Trả về ngay lập tức nhưng vẫn phải đợi userData
    return { skipped: true }
  }

  // Chỉ nhánh này mới sử dụng userData
  return processUserData(userData)
}
```

**Đúng (chỉ chặn khi cần thiết):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Trả về ngay lập tức mà không cần đợi
    return { skipped: true }
  }

  // Chỉ fetch khi cần thiết
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**Một ví dụ khác (tối ưu hóa return sớm):**

```typescript
// Sai: luôn fetch permissions
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId)
  const resource = await getResource(resourceId)

  if (!resource) {
    return { error: 'Not found' }
  }

  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }

  return await updateResourceData(resource, permissions)
}

// Đúng: chỉ fetch khi cần thiết
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId)

  if (!resource) {
    return { error: 'Not found' }
  }

  const permissions = await fetchPermissions(userId)

  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }

  return await updateResourceData(resource, permissions)
}
```

Sự tối ưu hóa này đặc biệt có giá trị khi nhánh bị bỏ qua (skipped branch) thường xuyên được thực thi, hoặc khi thao tác bị trì hoãn là tốn kém.
