'use client'

import { updateMenuRequestStatusAction } from '@/app/actions/menu-request'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { MenuRequest, Recipe, User } from '@/generated/prisma/client'
import { CheckCircle, Clock, Loader2, MessageSquare, XCircle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type MenuRequestWithRelations = MenuRequest & {
  user: Pick<User, 'id' | 'name' | 'avatar'>
  recipe: Recipe | null
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ duyệt',
    icon: Clock,
    className: 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  },
  APPROVED: {
    label: 'Đã duyệt',
    icon: CheckCircle,
    className: 'border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  },
  REJECTED: {
    label: 'Từ chối',
    icon: XCircle,
    className: 'border-red-400 text-red-500 bg-red-50 dark:bg-red-950/30',
  },
}

const MEAL_TIME_LABEL = { LUNCH: '🌞 Bữa trưa', DINNER: '🌙 Bữa tối' }

interface MenuRequestsPanelProps {
  requests: MenuRequestWithRelations[]
}

export function MenuRequestsPanel({ requests: initialRequests }: MenuRequestsPanelProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const processedRequests = requests.filter((r) => r.status !== 'PENDING')

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id)
    startTransition(async () => {
      const result = await updateMenuRequestStatusAction(id, action)
      setProcessingId(null)
      if (result.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)))
        toast.success(action === 'APPROVED' ? 'Đã duyệt yêu cầu!' : 'Đã từ chối yêu cầu!')
      } else {
        toast.error(result.error ?? 'Có lỗi xảy ra!')
      }
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <h2 className='text-lg font-semibold'>Yêu cầu từ thành viên</h2>
        {pendingRequests.length > 0 && (
          <Badge className='bg-amber-500 text-white'>{pendingRequests.length} chờ duyệt</Badge>
        )}
      </div>

      {requests.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-muted-foreground'>
          <MessageSquare className='h-12 w-12 opacity-25' />
          <p>Chưa có yêu cầu nào từ thành viên</p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className='flex flex-col gap-2'>
              <h3 className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
                Chờ duyệt ({pendingRequests.length})
              </h3>
              {pendingRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onApprove={() => handleAction(req.id, 'APPROVED')}
                  onReject={() => handleAction(req.id, 'REJECTED')}
                  isProcessing={processingId === req.id && isPending}
                />
              ))}
            </div>
          )}

          {pendingRequests.length > 0 && processedRequests.length > 0 && <Separator />}

          {/* Processed requests */}
          {processedRequests.length > 0 && (
            <div className='flex flex-col gap-2'>
              <h3 className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
                Đã xử lý ({processedRequests.length})
              </h3>
              {processedRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface RequestCardProps {
  request: MenuRequestWithRelations
  onApprove?: () => void
  onReject?: () => void
  isProcessing?: boolean
}

function RequestCard({ request, onApprove, onReject, isProcessing }: RequestCardProps) {
  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
  const isPending = request.status === 'PENDING'

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 ${isPending ? 'border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-950/10' : ''}`}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-medium'>{request.dishName}</span>
            <Badge variant='outline' className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>

          <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
            <span>👤 {request.user.name}</span>
            {request.mealTime && (
              <span>{MEAL_TIME_LABEL[request.mealTime as keyof typeof MEAL_TIME_LABEL]}</span>
            )}
            {request.date && <span>📅 {new Date(request.date).toLocaleDateString('vi-VN')}</span>}
            <span>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          {request.note && <p className='text-sm text-muted-foreground italic'>"{request.note}"</p>}
        </div>

        {isPending && onApprove && onReject && (
          <div className='flex shrink-0 gap-1.5'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 border-emerald-500 text-xs text-emerald-600 hover:bg-emerald-50'
              onClick={onApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <CheckCircle className='mr-1 h-3.5 w-3.5' />
              )}
              Duyệt
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 border-red-400 text-xs text-red-500 hover:bg-red-50'
              onClick={onReject}
              disabled={isProcessing}
            >
              <XCircle className='mr-1 h-3.5 w-3.5' />
              Từ chối
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
