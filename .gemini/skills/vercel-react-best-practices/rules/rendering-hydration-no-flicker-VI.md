---
title: Ngăn chặn Hydration Mismatch mà Không bị Flickering
impact: TRUNG BÌNH
impactDescription: tránh nhấp nháy hình ảnh và lỗi hydration
tags: rendering, ssr, hydration, localStorage, flicker
---

## Ngăn chặn Hydration Mismatch mà Không bị Flickering

Khi render nội dung phụ thuộc vào client-side storage (localStorage, cookies), hãy tránh cả việc phá vỡ SSR và việc nhấp nháy sau khi hydration (post-hydration flickering) bằng cách inject một script đồng bộ cập nhật DOM trước khi React hydrates.

**Sai (làm hỏng SSR):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage không có sẵn trên server - gây lỗi
  const theme = localStorage.getItem('theme') || 'light'

  return <div className={theme}>{children}</div>
}
```

Server-side rendering sẽ thất bại vì `localStorage` là undefined.

**Sai (bị nhấp nháy hình ảnh - visual flickering):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Chạy sau hydration - gây ra hiện tượng nhấp nháy rõ rệt
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    }
  }, [])

  return <div className={theme}>{children}</div>
}
```

Component render lần đầu với giá trị mặc định (`light`), sau đó cập nhật sau khi hydration, gây ra hiện tượng nháy sáng nội dung không chính xác.

**Đúng (không flicker, không hydration mismatch):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id='theme-wrapper'>{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  )
}
```

Inline script thực thi đồng bộ trước khi hiển thị element, đảm bảo DOM đã có đúng giá trị. Không flicker, không hydration mismatch.

Pattern này đặc biệt hữu ích cho theme toggles, tùy chọn người dùng, trạng thái xác thực, và bất kỳ dữ liệu client-only nào cần hiển thị ngay lập tức mà không bị flash giá trị mặc định.
