---
title: Hoist Static JSX Elements
impact: THẤP
impactDescription: tránh việc tạo lại
tags: rendering, jsx, static, optimization
---

## Hoist Static JSX Elements

Tách các JSX tĩnh ra bên ngoài components để tránh việc tạo lại (re-creation).

**Sai (tạo lại element mỗi lần render):**

```tsx
function LoadingSkeleton() {
  return <div className='animate-pulse h-20 bg-gray-200' />
}

function Container() {
  return <div>{loading && <LoadingSkeleton />}</div>
}
```

**Đúng (tái sử dụng cùng một element):**

```tsx
const loadingSkeleton = <div className='animate-pulse h-20 bg-gray-200' />

function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

Điều này đặc biệt hữu ích cho các SVG nodes lớn và tĩnh, những thứ có thể tốn kém để tạo lại trong mỗi lần render.

**Lưu ý:** Nếu dự án của bạn đã bật [React Compiler](https://react.dev/learn/react-compiler), compiler sẽ tự động hoist các elements JSX tĩnh và tối ưu hóa việc re-render component, làm cho việc hoist thủ công trở nên không cần thiết.
