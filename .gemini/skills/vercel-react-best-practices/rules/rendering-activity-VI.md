---
title: Sử dụng Activity Component cho Show/Hide
impact: TRUNG BÌNH
impactDescription: bảo toàn state/DOM
tags: rendering, activity, visibility, state-preservation
---

## Sử dụng Activity Component cho Show/Hide

Sử dụng `<Activity>` của React để bảo toàn state/DOM cho các component tốn kém mà thường xuyên thay đổi trạng thái hiển thị.

**Sử dụng:**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

Tránh re-render tốn kém và mất state.
