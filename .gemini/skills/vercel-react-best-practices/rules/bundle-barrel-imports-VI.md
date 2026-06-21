---
title: Tránh Import Barrel File
impact: NGHIÊM TRỌNG
impactDescription: tốn 200-800ms import cost, build chậm
tags: bundle, imports, tree-shaking, barrel-files, performance
---

## Tránh Import Barrel File

Import trực tiếp từ các file nguồn thay vì barrel files để tránh tải hàng ngàn modules không sử dụng. **Barrel files** là các điểm entry re-export nhiều modules (ví dụ: `index.js` thực hiện `export * from './module'`).

Các thư viện icon và component phổ biến có thể có **tới 10,000 re-exports** trong file entry của chúng. Đối với nhiều React packages, **phải mất 200-800ms chỉ để import chúng**, ảnh hưởng đến cả tốc độ phát triển và cold start trên production.

**Tại sao tree-shaking không giúp:** Khi một thư viện được đánh dấu là external (không bundled), bundler không thể tối ưu hóa nó. Nếu bạn bundle nó để bật tree-shaking, quá trình build sẽ trở nên chậm hơn đáng kể do phải phân tích toàn bộ module graph.

**Sai (imports toàn bộ thư viện):**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Tải 1,583 modules, tốn thêm ~2.8s trong dev
// Runtime cost: 200-800ms cho mỗi cold start

import { Button, TextField } from '@mui/material'
// Tải 2,225 modules, tốn thêm ~4.2s trong dev
```

**Đúng (chỉ imports những gì bạn cần):**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Chỉ tải 3 modules (~2KB so với ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Chỉ tải những gì bạn dùng
```

**Thay thế (Next.js 13.5+):**

```js
// next.config.js - sử dụng optimizePackageImports
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
}

// Sau đó bạn có thể giữ cách barrel imports tiện lợi:
import { Check, X, Menu } from 'lucide-react'
// Tự động chuyển đổi thành direct imports tại thời điểm build
```

Direct imports giúp dev boot nhanh hơn 15-70%, build nhanh hơn 28%, cold start nhanh hơn 40%, và HMR nhanh hơn đáng kể.

Các thư viện thường bị ảnh hưởng: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

Tham khảo: [How we optimized package imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
