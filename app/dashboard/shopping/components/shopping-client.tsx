'use client'

import {
  getOrCreateShoppingListAction,
  getWeekShoppingAction,
  type ShoppingListWithItems,
} from '@/app/actions/shopping'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { FileDown } from 'lucide-react'
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

  const handleExportExcel = () => {
    if (!selectedList || !selectedDateStr) return

    try {
      if (selectedList.items.length === 0) {
        toast.error('Không có món đồ nào để xuất file!')
        return
      }

      const dataToExport = selectedList.items.map((item) => {
        return {
          'Tên món': item.ingredient.name || '',
          'Danh mục': item.ingredient.category?.name || 'Khác',
          'Số lượng': item.quantity || 0,
          'Đơn vị': item.unit || '',
          'Trạng thái': item.isBought ? 'Đã mua' : 'Chưa mua',
          'Ghi chú': item.note || '',
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đi chợ')

      const maxLengths = Object.keys(dataToExport[0] || {}).map((key) => {
        return Math.max(
          key.length + 4,
          ...dataToExport.map((row: any) => String(row[key] || '').length + 2),
        )
      })
      worksheet['!cols'] = maxLengths.map((w) => ({ wch: w }))

      XLSX.writeFile(workbook, `Danh_sach_di_cho_${selectedDateStr}.xlsx`)
      toast.success(`Đã xuất thành công ${selectedList.items.length} món ra file Excel!`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất file Excel!')
      console.error(error)
    }
  }

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
          <div className='flex items-center justify-between border-b pb-2'>
            <h3 className='text-xl font-semibold'>
              Chi tiết mua sắm ngày {new Date(selectedDateStr).toLocaleDateString('vi-VN')}
            </h3>
            <button
              onClick={handleExportExcel}
              className='flex h-8 items-center gap-1.5 rounded-md border border-emerald-600/30 px-3 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
            >
              <FileDown className='size-4' />
              <span className='hidden sm:inline'>Xuất Excel</span>
            </button>
          </div>
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
