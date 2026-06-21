---
title: Sử dụng Functional setState Updates
impact: TRUNG BÌNH
impactDescription: ngăn chặn stale closures và tái tạo callback không cần thiết
tags: react, hooks, useState, useCallback, callbacks, closures
---

## Sử dụng Functional setState Updates

Khi cập nhật state dựa trên giá trị state hiện tại, hãy sử dụng dạng functional update của setState thay vì tham chiếu trực tiếp biến state. Điều này ngăn chặn stale closures, loại bỏ các dependencies không cần thiết, và tạo ra các tham chiếu callback ổn định.

**Sai (yêu cầu state là dependency):**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)

  // Callback phải phụ thuộc vào items, tái tạo mỗi khi items thay đổi
  const addItems = useCallback(
    (newItems: Item[]) => {
      setItems([...items, ...newItems])
    },
    [items],
  ) // ❌ items dependency gây ra việc tái tạo

  // Nguy cơ stale closure nếu quên dependency
  const removeItem = useCallback((id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }, []) // ❌ Thiếu items dependency - sẽ sử dụng stale items!

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

Callback đầu tiên được tái tạo mỗi lần `items` thay đổi, điều này có thể khiến các component con re-render không cần thiết. Callback thứ hai có lỗi stale closure—nó sẽ luôn tham chiếu đến giá trị `items` ban đầu.

**Đúng (stable callbacks, không stale closures):**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)

  // Stable callback, không bao giờ bị tái tạo
  const addItems = useCallback((newItems: Item[]) => {
    setItems((curr) => [...curr, ...newItems])
  }, []) // ✅ Không cần dependencies

  // Luôn sử dụng giá trị state mới nhất, không có rủi ro stale closure
  const removeItem = useCallback((id: string) => {
    setItems((curr) => curr.filter((item) => item.id !== id))
  }, []) // ✅ An toàn và ổn định

  return <ItemsEditor items={items} onAdd={addItems} onRemove={removeItem} />
}
```

**Lợi ích:**

1. **Stable callback references** - Callbacks không cần phải tái tạo khi state thay đổi
2. **Không stale closures** - Luôn thao tác trên giá trị state mới nhất
3. **Ít dependencies hơn** - Đơn giản hóa mảng dependency và giảm rò rỉ bộ nhớ
4. **Ngăn chặn lỗi** - Loại bỏ nguồn lỗi closure phổ biến nhất trong React

**Khi nào dùng functional updates:**

- Bất kỳ setState nào phụ thuộc vào giá trị state hiện tại
- Bên trong useCallback/useMemo khi state là cần thiết
- Event handlers tham chiếu đến state
- Các hoạt động Async cập nhật state

**Khi nào cập nhật trực tiếp là ổn:**

- Đặt state thành một giá trị tĩnh: `setCount(0)`
- Đặt state chỉ từ props/arguments: `setName(newName)`
- State không phụ thuộc vào giá trị trước đó

**Lưu ý:** Nếu dự án của bạn đã bật [React Compiler](https://react.dev/learn/react-compiler), compiler có thể tự động tối ưu hóa một số trường hợp, nhưng functional updates vẫn được khuyến khích để đảm bảo tính chính xác và ngăn chặn lỗi stale closure.
