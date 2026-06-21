---
title: Animate SVG Wrapper Thay vì SVG Element
impact: THẤP
impactDescription: kích hoạt tăng tốc phần cứng
tags: rendering, svg, css, animation, performance
---

## Animate SVG Wrapper Thay vì SVG Element

Nhiều trình duyệt không có tăng tốc phần cứng cho CSS3 animations trên các thẻ SVG. Hãy bọc SVG trong một `<div>` và animate thẻ wrapper đó.

**Sai (animate trực tiếp thẻ SVG - không có tăng tốc phần cứng):**

```tsx
function LoadingSpinner() {
  return (
    <svg className='animate-spin' width='24' height='24' viewBox='0 0 24 24'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' />
    </svg>
  )
}
```

**Đúng (animate wrapper div - có tăng tốc phần cứng):**

```tsx
function LoadingSpinner() {
  return (
    <div className='animate-spin'>
      <svg width='24' height='24' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' stroke='currentColor' />
      </svg>
    </div>
  )
}
```

Điều này áp dụng cho tất cả CSS transforms và transitions (`transform`, `opacity`, `translate`, `scale`, `rotate`). Wrapper div cho phép trình duyệt sử dụng GPU acceleration để animation mượt mà hơn.
