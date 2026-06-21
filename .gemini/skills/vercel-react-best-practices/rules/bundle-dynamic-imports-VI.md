---
title: Dynamic Imports cho các Component nặng
impact: NGHIÊM TRỌNG
impactDescription: ảnh hưởng trực tiếp đến TTI và LCP
tags: bundle, dynamic-import, code-splitting, next-dynamic
---

## Dynamic Imports cho các Component nặng

Sử dụng `next/dynamic` để lazy-load các component lớn không cần thiết trong lần render đầu tiên.

**Sai (Monaco bundles với main chunk ~300KB):**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Đúng (Monaco tải theo yêu cầu):**

```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('./monaco-editor').then((m) => m.MonacoEditor), {
  ssr: false,
})

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```
