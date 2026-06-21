---
title: Sử dụng Conditional Rendering Rõ ràng
impact: THẤP
impactDescription: ngăn chặn render 0 hoặc NaN
tags: rendering, conditional, jsx, falsy-values
---

## Sử dụng Conditional Rendering Rõ ràng

Sử dụng toán tử 3 ngôi (ternary operators) (`? :`) rõ ràng thay vì `&&` cho conditional rendering khi điều kiện có thể là `0`, `NaN`, hoặc các giá trị falsy khác có thể được render.

**Sai (render "0" khi count là 0):**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count && <span className='badge'>{count}</span>}</div>
}

// Khi count = 0, renders: <div>0</div>
// Khi count = 5, renders: <div><span class="badge">5</span></div>
```

**Đúng (không render gì khi count là 0):**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className='badge'>{count}</span> : null}</div>
}

// Khi count = 0, renders: <div></div>
// Khi count = 5, renders: <div><span class="badge">5</span></div>
```
