---
title: Kiểm tra độ dài trước khi so sánh mảng
impact: TRUNG BÌNH-CAO
impactDescription: tránh các thao tác tốn kém khi độ dài khác nhau
tags: javascript, arrays, performance, optimization, comparison
---

## Kiểm tra độ dài trước khi so sánh mảng

Khi so sánh các mảng với các thao tác tốn kém (sắp xếp, deep equality, serialization), hãy kiểm tra độ dài trước. Nếu độ dài khác nhau, các mảng không thể bằng nhau.

Trong các ứng dụng thực tế, sự tối ưu hóa này đặc biệt có giá trị khi việc so sánh chạy trong các hot paths (event handlers, render loops).

**Sai (luôn chạy so sánh tốn kém):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Luôn sắp xếp và join, ngay cả khi độ dài khác nhau
  return current.sort().join() !== original.sort().join()
}
```

Hai lần sắp xếp O(n log n) chạy ngay cả khi `current.length` là 5 và `original.length` là 100. Ngoài ra còn có chi phí overhead của việc join mảng và so sánh chuỗi.

**Đúng (kiểm tra độ dài O(1) trước):**

```typescript
function hasChanges(current: string[], original: string[]) {
  // Return sớm nếu độ dài khác nhau
  if (current.length !== original.length) {
    return true
  }
  // Chỉ sắp xếp/join khi độ dài khớp
  const currentSorted = current.toSorted()
  const originalSorted = original.toSorted()
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) {
      return true
    }
  }
  return false
}
```

Cách tiếp cận mới này hiệu quả hơn vì:

- Tránh overhead của việc sắp xếp và join mảng khi độ dài khác nhau
- Tránh tiêu tốn bộ nhớ cho các chuỗi đã join (đặc biệt quan trọng đối với mảng lớn)
- Tránh làm thay đổi (mutate) các mảng gốc
- Return sớm khi tìm thấy sự khác biệt
