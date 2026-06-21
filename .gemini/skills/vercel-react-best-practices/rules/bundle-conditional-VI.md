---
title: Tải Module Có Điều Kiện
impact: CAO
impactDescription: chỉ tải dữ liệu lớn khi cần thiết
tags: bundle, conditional-loading, lazy-loading
---

## Tải Module Có Điều Kiện

Chỉ tải dữ liệu lớn hoặc các modules khi một tính năng được kích hoạt.

**Ví dụ (lazy-load animation frames):**

```tsx
function AnimationPlayer({ enabled }: { enabled: boolean }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then((mod) => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

Kiểm tra `typeof window !== 'undefined'` ngăn chặn việc bundling module này cho SSR, tối ưu hóa kích thước bundle server và tốc độ build.
