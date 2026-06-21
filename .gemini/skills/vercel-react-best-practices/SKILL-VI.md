---
name: vercel-react-best-practices
description: Hướng dẫn tối ưu hiệu suất React và Next.js từ Vercel Engineering. Skill này nên được sử dụng khi viết, review, hoặc refactor code React/Next.js để đảm bảo các pattern hiệu suất tối ưu. Kích hoạt cho các tác vụ liên quan đến React components, Next.js pages, data fetching, bundle optimization, hoặc cải thiện hiệu suất.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# Best Practices React của Vercel

Hướng dẫn tối ưu hiệu suất toàn diện cho ứng dụng React và Next.js, được duy trì bởi Vercel. Chứa 45 quy tắc trong 8 danh mục, được ưu tiên theo mức độ tác động để hướng dẫn refactoring tự động và sinh code.

## Khi Nào Áp Dụng

Tham khảo các hướng dẫn này khi:

- Viết React components hoặc Next.js pages mới
- Triển khai data fetching (client hoặc server-side)
- Review code về các vấn đề hiệu suất
- Refactor code React/Next.js hiện có
- Tối ưu bundle size hoặc thời gian tải

## Danh Mục Quy Tắc Theo Ưu Tiên

| Ưu Tiên | Danh Mục                  | Tác Động        | Tiền Tố      |
| ------- | ------------------------- | --------------- | ------------ |
| 1       | Loại Bỏ Waterfalls        | NGHIÊM TRỌNG    | `async-`     |
| 2       | Tối Ưu Bundle Size        | NGHIÊM TRỌNG    | `bundle-`    |
| 3       | Hiệu Suất Server-Side     | CAO             | `server-`    |
| 4       | Data Fetching Client-Side | TRUNG BÌNH-CAO  | `client-`    |
| 5       | Tối Ưu Re-render          | TRUNG BÌNH      | `rerender-`  |
| 6       | Hiệu Suất Rendering       | TRUNG BÌNH      | `rendering-` |
| 7       | Hiệu Suất JavaScript      | THẤP-TRUNG BÌNH | `js-`        |
| 8       | Patterns Nâng Cao         | THẤP            | `advanced-`  |

## Tham Khảo Nhanh

### 1. Loại Bỏ Waterfalls (NGHIÊM TRỌNG)

- `async-defer-await` - Di chuyển await vào nhánh thực sự sử dụng
- `async-parallel` - Sử dụng Promise.all() cho các thao tác độc lập
- `async-dependencies` - Sử dụng better-all cho dependencies một phần
- `async-api-routes` - Bắt đầu promises sớm, await muộn trong API routes
- `async-suspense-boundaries` - Sử dụng Suspense để stream nội dung

### 2. Tối Ưu Bundle Size (NGHIÊM TRỌNG)

- `bundle-barrel-imports` - Import trực tiếp, tránh barrel files
- `bundle-dynamic-imports` - Sử dụng next/dynamic cho components nặng
- `bundle-defer-third-party` - Tải analytics/logging sau hydration
- `bundle-conditional` - Tải modules chỉ khi tính năng được kích hoạt
- `bundle-preload` - Preload khi hover/focus để tăng tốc độ cảm nhận

### 3. Hiệu Suất Server-Side (CAO)

- `server-cache-react` - Sử dụng React.cache() để deduplicate trong request
- `server-cache-lru` - Sử dụng LRU cache để cache xuyên requests
- `server-serialization` - Giảm thiểu data truyền đến client components
- `server-parallel-fetching` - Tái cấu trúc components để song song hóa fetches
- `server-after-nonblocking` - Sử dụng after() cho các thao tác không chặn

### 4. Data Fetching Client-Side (TRUNG BÌNH-CAO)

- `client-swr-dedup` - Sử dụng SWR để tự động deduplicate requests
- `client-event-listeners` - Deduplicate global event listeners

### 5. Tối Ưu Re-render (TRUNG BÌNH)

- `rerender-defer-reads` - Không subscribe state chỉ dùng trong callbacks
- `rerender-memo` - Tách công việc nặng vào memoized components
- `rerender-dependencies` - Sử dụng primitive dependencies trong effects
- `rerender-derived-state` - Subscribe derived booleans, không phải raw values
- `rerender-functional-setstate` - Sử dụng functional setState cho stable callbacks
- `rerender-lazy-state-init` - Truyền function cho useState với giá trị nặng
- `rerender-transitions` - Sử dụng startTransition cho updates không khẩn cấp

### 6. Hiệu Suất Rendering (TRUNG BÌNH)

- `rendering-animate-svg-wrapper` - Animate div wrapper thay vì SVG element
- `rendering-content-visibility` - Sử dụng content-visibility cho danh sách dài
- `rendering-hoist-jsx` - Tách static JSX ra ngoài components
- `rendering-svg-precision` - Giảm độ chính xác tọa độ SVG
- `rendering-hydration-no-flicker` - Dùng inline script cho data client-only
- `rendering-activity` - Sử dụng Activity component cho show/hide
- `rendering-conditional-render` - Dùng ternary thay vì && cho conditionals

### 7. Hiệu Suất JavaScript (THẤP-TRUNG BÌNH)

- `js-batch-dom-css` - Gộp CSS changes qua classes hoặc cssText
- `js-index-maps` - Xây dựng Map cho repeated lookups
- `js-cache-property-access` - Cache object properties trong loops
- `js-cache-function-results` - Cache function results trong module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Gộp nhiều filter/map thành một loop
- `js-length-check-first` - Kiểm tra array length trước comparison nặng
- `js-early-exit` - Return sớm từ functions
- `js-hoist-regexp` - Hoist RegExp creation ra ngoài loops
- `js-min-max-loop` - Dùng loop cho min/max thay vì sort
- `js-set-map-lookups` - Dùng Set/Map cho O(1) lookups
- `js-tosorted-immutable` - Dùng toSorted() để immutability

### 8. Patterns Nâng Cao (THẤP)

- `advanced-event-handler-refs` - Lưu event handlers trong refs
- `advanced-use-latest` - useLatest cho stable callback refs

## Cách Sử Dụng

Đọc các file quy tắc riêng lẻ để có giải thích chi tiết và code examples:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
rules/_sections.md
```

Mỗi file quy tắc chứa:

- Giải thích ngắn gọn tại sao nó quan trọng
- Ví dụ code sai với giải thích
- Ví dụ code đúng với giải thích
- Context bổ sung và tham khảo

## Tài Liệu Đầy Đủ

Để xem hướng dẫn đầy đủ với tất cả quy tắc mở rộng: `AGENTS.md` hoặc `AGENTS-VI.md` (tiếng Việt)
