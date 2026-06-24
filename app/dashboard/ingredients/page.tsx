import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { IngredientWithRelations, columns } from './components/columns'
import { FloatingActionButtons } from './components/floating-action-buttons'
import { IngredientTable } from './components/ingredient-table'

export default async function IngredientsPage() {
  // Kiểm tra phân quyền: chỉ cho phép ADMIN truy cập trang này
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    redirect('/') // Redirect người dùng không phải admin về trang tổng quan
  }

  // Fetch dữ liệu song song
  const [rawItems, categories] = await Promise.all([
    prisma.ingredient.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  const items = rawItems as IngredientWithRelations[]

  // Thống kê nhanh nguyên liệu
  const totalIngredients = items.length

  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý nguyên liệu</h1>
          <p className='text-muted-foreground'>
            Quản lý thư viện nguyên liệu mẫu dùng chung cho hệ thống
          </p>
        </div>
      </div>

      {/* Top Status Card */}
      <div className='grid gap-2 md:grid-cols-3'>
        <Card className='border-muted/60 shadow-sm md:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-4xl font-bold text-emerald-600'>
              {totalIngredients}
            </CardTitle>
            <CardDescription className='font-bold text-foreground'>
              Tổng số nguyên liệu mẫu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Danh mục nguyên liệu chuẩn làm cơ sở dữ liệu nền cho việc tạo Công thức nấu ăn và Lập
              thực đơn.
            </p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm md:col-span-2'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-b text-lg font-bold'>Hướng dẫn cấu hình</CardTitle>
            <CardDescription className='text-muted-foreground'>
              Dành cho Quản trị viên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-1.5 text-muted-foreground'>
            <p>
              1. <strong>Tạo nguyên liệu:</strong> Bấm nút dấu cộng ở góc phải màn hình để thêm
              nguyên liệu chuẩn mới.
            </p>
            <p>
              2. <strong>Liên kết danh mục:</strong> Phân loại nguyên liệu chính xác giúp bộ lọc
              công thức hoạt động tốt hơn.
            </p>
            <p>
              3. <strong>Ảnh minh họa:</strong> Hãy cung cấp URL ảnh đẹp từ Unsplash hoặc lưu trữ
              đám mây để tăng trải nghiệm người dùng.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <IngredientTable columns={columns} data={items} categories={categories} />

      <FloatingActionButtons categories={categories} />
    </div>
  )
}
