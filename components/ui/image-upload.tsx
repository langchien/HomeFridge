'use client'

import { useCallback, useState, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
  folder?: string // Thư mục tùy chọn lưu trên Cloudinary
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
  folder = 'homie-fridge',
}: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  // Giải phóng local preview URL khi unmount để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file hình ảnh!')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dung lượng ảnh tối đa là 5MB!')
        return
      }

      // Tạo preview cục bộ ngay lập tức
      const previewUrl = URL.createObjectURL(file)
      setLocalPreview(previewUrl)

      if (!cloudName || !uploadPreset) {
        toast.warning('Chưa cấu hình tài khoản Cloudinary trong file .env! Bạn chỉ có thể xem ảnh cục bộ tạm thời.')
        console.warn('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
        return
      }

      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', folder)

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData?.error?.message || 'Upload failed'
          throw new Error(errorMessage)
        }

        const data = await response.json()
        if (data.secure_url) {
          onChange(data.secure_url)
          toast.success('Tải ảnh lên Cloudinary thành công!')
        } else {
          throw new Error('No secure URL returned')
        }
      } catch (error: any) {
        console.error('Error uploading image to Cloudinary:', error)
        toast.error(`Lỗi: ${error?.message || 'Không thể tải ảnh lên Cloudinary'}`)
      } finally {
        setIsUploading(false)
      }
    },
    [cloudName, uploadPreset, onChange, folder]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (disabled || isUploading) return

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await uploadFile(e.dataTransfer.files[0])
      }
    },
    [disabled, isUploading, uploadFile]
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || isUploading) return

      if (e.target.files && e.target.files[0]) {
        await uploadFile(e.target.files[0])
      }
    },
    [disabled, isUploading, uploadFile]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
      setLocalPreview(null)
      onChange('')
    },
    [onChange, localPreview]
  )

  const displayImage = localPreview || value

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {displayImage ? (
        <div className="relative flex items-center justify-center border rounded-lg overflow-hidden bg-muted/30 aspect-video md:aspect-[2/1] max-h-[200px]">
          <Image
            src={displayImage}
            alt="Upload preview"
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
          {!disabled && !isUploading && (
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors shadow-sm cursor-pointer z-10"
              title="Xóa ảnh"
            >
              <X className="size-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 backdrop-blur-xs z-10">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground mt-2 font-medium">Đang tải lên Cloudinary...</span>
            </div>
          )}
        </div>
      ) : (
        <label
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 min-h-[140px] p-4 text-center',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10',
            (disabled || isUploading) && 'opacity-60 cursor-not-allowed pointer-events-none'
          )}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Đang tải ảnh lên...</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-1">
                  <Upload className="size-5" />
                </div>
                <p className="text-sm font-semibold">
                  Click để chọn ảnh <span className="text-muted-foreground font-normal">hoặc kéo thả vào đây</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ PNG, JPG, WEBP (tối đa 5MB)
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  )
}
