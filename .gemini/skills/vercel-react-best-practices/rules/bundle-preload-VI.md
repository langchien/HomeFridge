---
title: Preload Dựa trên Ý định Người dùng
impact: TRUNG BÌNH
impactDescription: giảm độ trễ cảm nhận
tags: bundle, preload, user-intent, hover
---

## Preload Dựa trên Ý định Người dùng

Preload các bundle nặng trước khi chúng cần thiết để giảm độ trễ cảm nhận.

**Ví dụ (preload khi hover/focus):**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  )
}
```

**Ví dụ (preload khi feature flag được bật):**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== 'undefined') {
      void import('./monaco-editor').then((mod) => mod.init())
    }
  }, [flags.editorEnabled])

  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>
}
```

Kiểm tra `typeof window !== 'undefined'` ngăn chặn việc bundling các module đã preload cho SSR, tối ưu hóa kích thước bundle server và tốc độ build.
