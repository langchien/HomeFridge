'use client'

import { FridgeItemWithIngredient } from '@/app/actions/fridge'
import { useEffect, useMemo, useState } from 'react'
import { FridgeDataTable } from './fridge-data-table'
import { FridgeGrid } from './fridge-grid'
import { FridgeToolbar, ViewMode } from './fridge-toolbar'

const STORAGE_KEY = 'fridge-view-mode'

interface FridgeViewProps {
  items: FridgeItemWithIngredient[]
}

export function FridgeView({ items }: FridgeViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string[]>([])

  // Khôi phục viewMode từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null
    if (saved === 'grid' || saved === 'table') {
      setViewMode(saved)
    }
  }, [])

  // Lưu viewMode vào localStorage khi thay đổi
  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  // Filter logic — tổng hợp tất cả điều kiện
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search theo tên nguyên liệu
      if (
        searchQuery.trim() &&
        !item.ingredient.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false
      }

      // Filter theo trạng thái
      if (statusFilter.length > 0 && !statusFilter.includes(item.status)) {
        return false
      }

      // Filter theo vị trí
      if (locationFilter.length > 0 && !locationFilter.includes(item.storageLocation)) {
        return false
      }

      return true
    })
  }, [items, searchQuery, statusFilter, locationFilter])

  return (
    <div className='space-y-4'>
      {/* Toolbar: Search + Filter + Toggle + Add */}
      <FridgeToolbar
        items={items}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
      />

      {/* Content */}
      {viewMode === 'grid' ? (
        <FridgeGrid items={filteredItems} />
      ) : (
        <FridgeDataTable items={filteredItems} />
      )}
    </div>
  )
}
