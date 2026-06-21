---
title: Suspense Boundaries Chiến Lược
impact: CAO
impactDescription: faster initial paint
tags: async, suspense, streaming, layout-shift
---

## Suspense Boundaries Chiến Lược

Thay vì chờ đợi dữ liệu trong các async components trước khi trả về JSX, hãy sử dụng Suspense boundaries để hiển thị UI bao quanh nhanh hơn trong khi dữ liệu đang tải.

**Sai (wrapper bị chặn bởi việc lấy dữ liệu):**

```tsx
async function Page() {
  const data = await fetchData() // Chặn toàn bộ trang

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

Toàn bộ layout phải chờ dữ liệu mặc dù chỉ có phần giữa là cần nó.

**Đúng (wrapper hiển thị ngay lập tức, dữ liệu stream vào sau):**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Chỉ chặn component này
  return <div>{data.content}</div>
}
```

Sidebar, Header, và Footer render ngay lập tức. Chỉ DataDisplay phải chờ dữ liệu.

**Thay thế (chia sẻ promise giữa các components):**

```tsx
function Page() {
  // Bắt đầu fetch ngay lập tức, nhưng không await
  const dataPromise = fetchData()

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay dataPromise={dataPromise} />
        <DataSummary dataPromise={dataPromise} />
      </Suspense>
      <div>Footer</div>
    </div>
  )
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Unwraps promise
  return <div>{data.content}</div>
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise) // Dùng lại cùng một promise
  return <div>{data.summary}</div>
}
```

Cả hai components chia sẻ cùng một promise, vì vậy chỉ có một lần fetch xảy ra. Layout render ngay lập tức trong khi cả hai components cùng chờ đợi.

**Khi nào KHÔNG nên dùng pattern này:**

- Dữ liệu quan trọng cần cho các quyết định layout (ảnh hưởng đến vị trí)
- Nội dung quan trọng cho SEO ở trên fold (phần hiển thị đầu tiên)
- Các query nhỏ, nhanh mà chi phí cho suspense không đáng
- Khi bạn muốn tránh layout shift (đang loading -> nội dung nhảy ra)

**Đánh đổi:** Initial paint nhanh hơn so với nguy cơ layout shift. Hãy chọn dựa trên ưu tiên UX của bạn.
