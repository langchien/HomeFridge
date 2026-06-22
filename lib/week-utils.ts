/**
 * Utility functions dùng chung cho tính toán tuần,
 * tách riêng để tránh xung đột với 'use server' directive.
 */

/**
 * Trả về đầu tuần (Thứ 2 00:00:00 UTC) của một ngày bất kỳ.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=CN, 1=T2, ..., 6=T7
  const diff = day === 0 ? -6 : 1 - day // kéo về Thứ 2
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Trả về cuối tuần (Chủ nhật 23:59:59 UTC).
 */
export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart)
  d.setUTCDate(d.getUTCDate() + 6)
  d.setUTCHours(23, 59, 59, 999)
  return d
}
