---
title: CSS content-visibility cho Long Lists
impact: CAO
impactDescription: initial render nhanh hơn
tags: rendering, css, content-visibility, long-lists
---

## CSS content-visibility cho Long Lists

Áp dụng `content-visibility: auto` để trì hoãn việc render off-screen (bên ngoài màn hình).

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**Ví dụ:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className='overflow-y-auto h-screen'>
      {messages.map((msg) => (
        <div key={msg.id} className='message-item'>
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

Đối với 1000 messages, trình duyệt bỏ qua layout/paint cho ~990 items off-screen (initial render nhanh hơn 10 lần).
