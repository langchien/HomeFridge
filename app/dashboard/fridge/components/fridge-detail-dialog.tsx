'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CalendarDays,
  MapPin,
  Package,
  Tag,
  User,
  Clock,
  RefreshCw,
  FileText,
  BookOpen,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import type { FridgeItemWithRelations } from './columns'

const locationMap: Record<string, string> = {
  FREEZER: 'Tủ đông',
  CHILLER: 'Ngăn mát (Chiller)',
  FRIDGE_SHELF: 'Ngăn kệ',
  VEGETABLE_DRAWER: 'Ngăn rau củ',
  DOOR_SHELF: 'Ngăn cửa',
  PANTRY: 'Tủ bếp',
}

const locationIconMap: Record<string, string> = {
  FREEZER: '🧊',
  CHILLER: '❄️',
  FRIDGE_SHELF: '🗄️',
  VEGETABLE_DRAWER: '🥬',
  DOOR_SHELF: '🚪',
  PANTRY: '🍳',
}

interface FridgeDetailDialogProps {
  item: FridgeItemWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (item: FridgeItemWithRelations) => void
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </p>
        <div className='mt-0.5 text-sm text-foreground'>{value}</div>
      </div>
    </div>
  )
}

export function FridgeDetailDialog({ item, open, onOpenChange, onEdit }: FridgeDetailDialogProps) {
  if (!item) return null

  const now = new Date()
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const isExpired = expiryDate ? expiryDate < now : false
  const isExpiringSoon = expiryDate ? expiryDate >= now && expiryDate < threeDaysFromNow : false

  const expiryDaysLeft = expiryDate
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]'>
        {/* Ảnh header */}
        <div className='relative h-52 w-full overflow-hidden rounded-t-lg bg-secondary/40 sm:h-60'>
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className='object-cover' sizes='560px' />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-7xl'>
              {item.category?.icon || '🍽️'}
            </div>
          )}

          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

          {/* Badge trạng thái */}
          <div className='absolute right-4 bottom-3 left-4 flex items-end justify-between'>
            {isExpired ? (
              <Badge
                variant='destructive'
                className='flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-lg'
              >
                <XCircle className='size-3.5' />
                Đã hết hạn
              </Badge>
            ) : isExpiringSoon ? (
              <Badge className='flex items-center gap-1.5 border-amber-400 bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg'>
                <AlertTriangle className='size-3.5' />
                Sắp hết hạn
                {expiryDaysLeft !== null && expiryDaysLeft > 0 && (
                  <span className='opacity-90'>({expiryDaysLeft} ngày)</span>
                )}
              </Badge>
            ) : (
              <Badge className='flex items-center gap-1.5 border-emerald-400 bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg'>
                <CheckCircle2 className='size-3.5' />
                Còn hạn sử dụng
                {expiryDaysLeft !== null && expiryDaysLeft > 0 && (
                  <span className='opacity-90'>({expiryDaysLeft} ngày)</span>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Nội dung */}
        <div className='flex flex-col gap-5 p-5'>
          <DialogHeader className='space-y-1'>
            <DialogTitle className='text-xl leading-tight font-bold'>{item.name}</DialogTitle>
            <p className='text-sm text-muted-foreground'>
              {item.category?.icon} {item.category?.name}
            </p>
          </DialogHeader>

          {/* Grid thông tin cơ bản */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <InfoRow
              icon={<Package className='size-4' />}
              label='Số lượng'
              value={
                <span className='font-medium'>
                  {item.quantity} {item.unit}
                </span>
              }
            />
            <InfoRow
              icon={<MapPin className='size-4' />}
              label='Vị trí bảo quản'
              value={
                <span>
                  {locationIconMap[item.location] || '📦'}{' '}
                  {locationMap[item.location] || item.location}
                </span>
              }
            />
            <InfoRow
              icon={<Tag className='size-4' />}
              label='Danh mục'
              value={
                <Badge variant='outline' className='font-normal'>
                  {item.category?.icon} {item.category?.name}
                </Badge>
              }
            />
            <InfoRow
              icon={<CalendarDays className='size-4' />}
              label='Hạn sử dụng'
              value={
                expiryDate ? (
                  <span
                    className={
                      isExpired
                        ? 'font-semibold text-destructive'
                        : isExpiringSoon
                          ? 'font-semibold text-amber-500'
                          : 'font-medium'
                    }
                  >
                    {expiryDate.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>Không có</span>
                )
              }
            />
          </div>

          {/* Phần thông tin bổ sung */}
          {(item.storageInstructions || item.notes) && (
            <>
              <Separator />
              <div className='flex flex-col gap-4'>
                {item.storageInstructions && (
                  <InfoRow
                    icon={<BookOpen className='size-4' />}
                    label='Hướng dẫn bảo quản'
                    value={
                      <p className='text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                        {item.storageInstructions}
                      </p>
                    }
                  />
                )}
                {item.notes && (
                  <InfoRow
                    icon={<FileText className='size-4' />}
                    label='Ghi chú'
                    value={
                      <p className='text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                        {item.notes}
                      </p>
                    }
                  />
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Người thêm & timestamps */}
          <div className='flex flex-col gap-4'>
            <InfoRow
              icon={<User className='size-4' />}
              label='Người thêm'
              value={
                <span className='font-medium'>
                  {item.user?.name}{' '}
                  {item.user?.username && (
                    <span className='font-normal text-muted-foreground'>
                      (@{item.user.username})
                    </span>
                  )}
                </span>
              }
            />
            <div className='grid grid-cols-2 gap-4'>
              <InfoRow
                icon={<Clock className='size-4' />}
                label='Ngày thêm'
                value={
                  <span className='text-xs text-muted-foreground'>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                }
              />
              <InfoRow
                icon={<RefreshCw className='size-4' />}
                label='Cập nhật lần cuối'
                value={
                  <span className='text-xs text-muted-foreground'>
                    {new Date(item.updatedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                }
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className='flex justify-end gap-2 pt-1'>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='h-9 text-xs'>
              Đóng
            </Button>
            <Button
              onClick={() => onEdit(item)}
              className='h-9 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700'
            >
              <Edit2 className='size-3.5' />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
