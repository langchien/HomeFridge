'use client'

import { deductFridgeItemsAction } from '@/app/actions/menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { DailyMenuItem, FridgeItem, Recipe, RecipeIngredient } from '@/generated/prisma/client'
import { AlertCircle, CheckCircle2, Loader2, Refrigerator, X, ChevronsUpDown } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

type MenuItemWithRecipe = DailyMenuItem & {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}

type FridgeItemBasic = Pick<FridgeItem, 'id' | 'name' | 'quantity' | 'unit'>

interface FridgeItemComboboxProps {
  value: string | null
  onChange: (value: string | null) => void
  items: FridgeItemBasic[]
  disabled?: boolean
}

function FridgeItemCombobox({ value, onChange, items, disabled }: FridgeItemComboboxProps) {
  const [open, setOpen] = useState(false)
  const selectedItem = items.find((f) => f.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className='h-8 w-full justify-between px-2 text-xs font-normal bg-background border-input'
        >
          <span className='truncate'>
            {selectedItem ? `${selectedItem.name} (${selectedItem.quantity} ${selectedItem.unit})` : '— Không chọn —'}
          </span>
          <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[280px] p-0' align='start'>
        <Command>
          <CommandInput placeholder='Tìm nguyên liệu...' className='h-8' />
          <CommandList>
            <CommandEmpty>Không tìm thấy nguyên liệu.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value='none'
                keywords={['khong', 'chon', 'bỏ', 'huy', 'none']}
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className='text-xs'
              >
                — Không chọn —
              </CommandItem>
              {items.map((f) => (
                <CommandItem
                  key={f.id}
                  value={`${f.name} ${f.quantity} ${f.unit}`}
                  onSelect={() => {
                    onChange(f.id)
                    setOpen(false)
                  }}
                  className='text-xs'
                >
                  <span className='truncate'>{f.name}</span>
                  <span className='ml-auto text-[10px] text-muted-foreground whitespace-nowrap'>
                    ({f.quantity} {f.unit})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Tổng hợp nguyên liệu từ tất cả món trong menu
function aggregateIngredients(menuItems: MenuItemWithRecipe[]) {
  const map = new Map<string, { name: string; totalQty: number; unit: string; sources: string[] }>()

  for (const menuItem of menuItems) {
    const servings = menuItem.servings
    for (const ing of menuItem.recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`
      if (map.has(key)) {
        const existing = map.get(key)!
        existing.totalQty += ing.quantity * servings
        existing.sources.push(menuItem.recipe.name)
      } else {
        map.set(key, {
          name: ing.name,
          totalQty: ing.quantity * servings,
          unit: ing.unit,
          sources: [menuItem.recipe.name],
        })
      }
    }
  }

  return Array.from(map.values())
}

interface DeductRow {
  name: string
  quantity: number
  unit: string
  sources: string[]
  fridgeItemId: string | null
  enabled: boolean
}

interface DeductFridgeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuDate: string
  menuItems: MenuItemWithRecipe[]
  fridgeItems: FridgeItemBasic[]
}

export function DeductFridgeDialog({
  open,
  onOpenChange,
  menuDate,
  menuItems,
  fridgeItems,
}: DeductFridgeDialogProps) {
  const [isPending, startTransition] = useTransition()

  // Khởi tạo danh sách nguyên liệu
  const aggregated = aggregateIngredients(menuItems)
  const [rows, setRows] = useState<DeductRow[]>(() =>
    aggregated.map((ing) => {
      // Tự động match với FridgeItem cùng đơn vị
      const matched = fridgeItems.find(
        (f) => f.name.toLowerCase() === ing.name.toLowerCase() && f.unit === ing.unit,
      )
      return {
        name: ing.name,
        quantity: ing.totalQty,
        unit: ing.unit,
        sources: ing.sources,
        fridgeItemId: matched?.id ?? null,
        enabled: true,
      }
    }),
  )

  // Reset khi dialog mở
  useState(() => {
    if (open) {
      setRows(
        aggregated.map((ing) => {
          const matched = fridgeItems.find(
            (f) => f.name.toLowerCase() === ing.name.toLowerCase() && f.unit === ing.unit,
          )
          return {
            name: ing.name,
            quantity: ing.totalQty,
            unit: ing.unit,
            sources: ing.sources,
            fridgeItemId: matched?.id ?? null,
            enabled: true,
          }
        }),
      )
    }
  })

  const updateRow = (index: number, patch: Partial<DeductRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    const activeRows = rows.filter((r) => r.enabled && r.fridgeItemId)

    if (activeRows.length === 0) {
      toast.error('Chưa chọn nguyên liệu nào để trừ!')
      return
    }

    startTransition(async () => {
      const result = await deductFridgeItemsAction(
        activeRows.map((r) => ({
          fridgeItemId: r.fridgeItemId!,
          quantityToDeduct: r.quantity,
        })),
      )

      if (result.success) {
        toast.success(`Đã trừ ${activeRows.length} nguyên liệu trong tủ lạnh!`)
        onOpenChange(false)
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  const enabledRows = rows.filter((r) => r.enabled)
  const mappedCount = enabledRows.filter((r) => r.fridgeItemId !== null).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] min-w-2xl flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Refrigerator className='h-5 w-5 text-primary' />
            Trừ nguyên liệu tủ lạnhh
          </DialogTitle>
          <DialogDescription>
            Menu ngày {menuDate} — {menuItems.length} món ăn
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className='flex gap-3 rounded-lg bg-muted/50 p-3 text-sm'>
          <div className='flex items-center gap-1.5'>
            <CheckCircle2 className='h-4 w-4 text-emerald-500' />
            <span>{mappedCount} nguyên liệu đã khớp</span>
          </div>
          {enabledRows.length - mappedCount > 0 && (
            <div className='flex items-center gap-1.5 text-amber-600'>
              <AlertCircle className='h-4 w-4' />
              <span>{enabledRows.length - mappedCount} chưa khớp</span>
            </div>
          )}
        </div>

        <div className='flex-1 overflow-y-auto'>
          {rows.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <Refrigerator className='h-10 w-10 opacity-30' />
              <p>Không có nguyên liệu nào</p>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {/* Column headers */}
              <div className='grid grid-cols-[1fr_90px_80px_1fr_36px] gap-2 px-1 text-xs font-medium text-muted-foreground'>
                <span>Nguyên liệu</span>
                <span>Số lượng</span>
                <span>Đơn vị</span>
                <span>Khớp với tủ lạnh</span>
                <span />
              </div>

              {rows.map((row, index) => {
                const matched = fridgeItems.find((f) => f.id === row.fridgeItemId)
                const isInsufficient = matched && matched.quantity < row.quantity

                return (
                  <div
                    key={index}
                    className={`grid grid-cols-[1fr_90px_80px_1fr_36px] items-center gap-2 rounded-lg p-2 transition-colors ${
                      !row.enabled
                        ? 'bg-muted/30 opacity-40'
                        : isInsufficient
                          ? 'bg-red-50 dark:bg-red-950/20'
                          : row.fridgeItemId
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/10'
                            : 'bg-amber-50/50 dark:bg-amber-950/10'
                    }`}
                  >
                    {/* Tên nguyên liệu */}
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <span className='truncate text-sm font-medium'>{row.name}</span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {[...new Set(row.sources)].join(', ')}
                      </span>
                    </div>

                    {/* Số lượng */}
                    <Input
                      type='number'
                      min='0'
                      step='0.01'
                      value={row.quantity}
                      disabled={!row.enabled}
                      className='h-8 text-sm'
                      onChange={(e) =>
                        updateRow(index, { quantity: parseFloat(e.target.value) || 0 })
                      }
                    />

                    {/* Đơn vị */}
                    <Input
                      value={row.unit}
                      disabled={!row.enabled}
                      className='h-8 text-sm'
                      onChange={(e) => updateRow(index, { unit: e.target.value })}
                    />

                    {/* Combobox FridgeItem */}
                    <div className='flex flex-col gap-0.5'>
                      <FridgeItemCombobox
                        value={row.fridgeItemId}
                        onChange={(val) => updateRow(index, { fridgeItemId: val })}
                        items={fridgeItems}
                        disabled={!row.enabled}
                      />
                      {isInsufficient && (
                        <span className='text-xs text-red-500'>
                          Không đủ! Còn {matched!.quantity} {matched!.unit}
                        </span>
                      )}
                    </div>

                    {/* Nút xóa dòng */}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-destructive'
                      onClick={() => removeRow(index)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || mappedCount === 0}>
            {isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Refrigerator className='mr-2 h-4 w-4' />
            )}
            Xác nhận trừ ({mappedCount} nguyên liệu)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
