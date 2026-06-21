---
title: Tối ưu hóa Độ chính xác SVG
impact: THẤP
impactDescription: giảm kích thước file
tags: rendering, svg, optimization, svgo
---

## Tối ưu hóa Độ chính xác SVG

Giảm độ chính xác tọa độ SVG để giảm kích thước file. Độ chính xác tối ưu phụ thuộc vào kích thước viewBox, nhưng nói chung nên xem xét việc giảm độ chính xác.

**Sai (độ chính xác quá mức):**

```svg
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />
```

**Đúng (1 số thập phân):**

```svg
<path d="M 10.3 20.8 L 30.9 40.2" />
```

**Tự động hóa với SVGO:**

```bash
npx svgo --precision=1 --multipass icon.svg
```
