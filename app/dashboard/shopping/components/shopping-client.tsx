'use client'

import {
  getOrCreateShoppingListAction,
  getWeekShoppingAction,
  type ShoppingListWithItems,
} from '@/app/actions/shopping'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { ShoppingListDetail } from './shopping-list-detail'
import { WeeklyShoppingBoard } from './weekly-shopping-board'

interface ShoppingClientProps {
  initialWeekStart: Date
  initialLists: ShoppingListWithItems[]
  ingredients: any[]
}

export function ShoppingClient({
  initialWeekStart,
  initialLists,
  ingredients,
}: ShoppingClientProps) {
  const [weekStart, setWeekStart] = useState<Date>(initialWeekStart)
  const [shoppingLists, setShoppingLists] = useState<ShoppingListWithItems[]>(initialLists)
  const [loading, setLoading] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)

  const fetchLists = useCallback(async (ws: Date) => {
    setLoading(true)
    try {
      const result = await getWeekShoppingAction(ws)
      if (result.data) setShoppingLists(result.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleWeekChange = (newWeekStart: Date) => {
    setWeekStart(newWeekStart)
    setSelectedDateStr(null)
    fetchLists(newWeekStart)
  }

  const handleSelectDate = async (dateStr: string) => {
    // Nếu chưa có list cho ngày này, gọi API tạo mới
    const listExists = shoppingLists.find(
      (l) => new Date(l.date).toISOString().split('T')[0] === dateStr,
    )

    if (!listExists) {
      const loadingToast = toast.loading('Đang khởi tạo danh sách...')
      try {
        const res = await getOrCreateShoppingListAction(dateStr)
        if (res.error) {
          toast.error(res.error, { id: loadingToast })
          return
        }
        toast.success('Đã tạo danh sách mới', { id: loadingToast })
        // Cập nhật lại list
        fetchLists(weekStart)
      } catch (err) {
        toast.error('Lỗi khi tạo danh sách', { id: loadingToast })
        return
      }
    }

    setSelectedDateStr(dateStr)
  }

  const selectedList = selectedDateStr
    ? shoppingLists.find((l) => new Date(l.date).toISOString().split('T')[0] === selectedDateStr)
    : null

  return (
    <div className={`flex flex-col gap-8 transition-opacity ${loading ? 'opacity-60' : ''}`}>
      <WeeklyShoppingBoard
        weekStart={weekStart}
        shoppingLists={shoppingLists}
        selectedDateStr={selectedDateStr}
        onWeekChange={handleWeekChange}
        onSelectDate={handleSelectDate}
      />

      {selectedDateStr && selectedList ? (
        <div className='flex animate-in flex-col gap-4 duration-500 fade-in slide-in-from-bottom-4'>
          <h3 className='border-b pb-2 text-xl font-semibold'>
            Chi tiết mua sắm ngày {new Date(selectedDateStr).toLocaleDateString('vi-VN')}
          </h3>
          <ShoppingListDetail
            list={selectedList}
            ingredients={ingredients}
            onDataChange={() => fetchLists(weekStart)}
          />
        </div>
      ) : selectedDateStr && !selectedList ? (
        <div className='flex justify-center p-8 text-muted-foreground'>Đang tải danh sách...</div>
      ) : (
        <div className='flex justify-center rounded-xl border border-dashed p-12 text-muted-foreground'>
          Chọn một ngày trên lịch để xem hoặc tạo danh sách mua sắm
        </div>
      )}
    </div>
  )
}
