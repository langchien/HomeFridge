---
title: Batch DOM CSS Changes
impact: TRUNG BÌNH
impactDescription: giảm reflows/repaints
tags: javascript, dom, css, performance, reflow
---

## Batch DOM CSS Changes (Gộp các thay đổi CSS DOM)

Tránh thay đổi styles từng thuộc tính một. Gộp nhiều thay đổi CSS lại với nhau thông qua classes hoặc `cssText` để giảm thiểu browser reflows.

**Sai (nhiều reflows):**

```typescript
function updateElementStyles(element: HTMLElement) {
  // Mỗi dòng kích hoạt một reflow
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'
  element.style.border = '1px solid black'
}
```

**Đúng (thêm class - một reflow):**

```typescript
// CSS file
.highlighted-box {
  width: 100px;
  height: 200px;
  background-color: blue;
  border: 1px solid black;
}

// JavaScript
function updateElementStyles(element: HTMLElement) {
  element.classList.add('highlighted-box')
}
```

**Đúng (thay đổi cssText - một reflow):**

```typescript
function updateElementStyles(element: HTMLElement) {
  element.style.cssText = `
    width: 100px;
    height: 200px;
    background-color: blue;
    border: 1px solid black;
  `
}
```

**Ví dụ React:**

```tsx
// Sai: thay đổi styles từng cái một
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && isHighlighted) {
      ref.current.style.width = '100px'
      ref.current.style.height = '200px'
      ref.current.style.backgroundColor = 'blue'
    }
  }, [isHighlighted])

  return <div ref={ref}>Content</div>
}

// Đúng: toggle class
function Box({ isHighlighted }: { isHighlighted: boolean }) {
  return <div className={isHighlighted ? 'highlighted-box' : ''}>Content</div>
}
```

Ưu tiên CSS classes hơn inline styles khi có thể. Classes được browser cache và cung cấp sự phân tách mối quan tâm (separation of concerns) tốt hơn.
