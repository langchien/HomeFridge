import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { columns, RecipeWithRelations } from './components/columns'
import { FloatingActionButtons } from './components/floating-action-buttons'
import { RecipeTable } from './components/recipe-table'

export default async function RecipesPage() {
  // Kiểm tra phân quyền: chỉ cho phép ADMIN và HOMEMAKER truy cập
  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'HOMEMAKER')) {
    redirect('/dashboard')
  }

  // Fetch dữ liệu song song
  const [rawRecipes, ingredients] = await Promise.all([
    prisma.recipe.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  const recipes = rawRecipes as RecipeWithRelations[]

  // Thống kê nhanh
  const totalRecipes = recipes.length
  const avgCookTime =
    recipes.length > 0
      ? Math.round(
          recipes.reduce((acc, r) => acc + (r.cookTime || 0) + (r.prepTime || 0), 0) /
            recipes.length,
        )
      : 0

  return (
    <div className='flex flex-col gap-6 p-6 pb-24'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý công thức nấu ăn</h1>
          <p className='text-muted-foreground'>
            Thư viện công thức nấu ăn dùng chung cho hệ thống HomeFridge
          </p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className='grid gap-2 md:grid-cols-3'>
        <Card className='border-muted/60 shadow-sm md:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-4xl font-bold text-amber-600'>{totalRecipes}</CardTitle>
            <CardDescription className='font-bold text-foreground'>
              Tổng số công thức
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Thư viện công thức chuẩn phục vụ gợi ý thực đơn và quản lý nguyên liệu.
            </p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-4xl font-bold text-amber-600'>
              {avgCookTime > 0 ? `~${avgCookTime}` : '—'}
            </CardTitle>
            <CardDescription className='font-bold text-foreground'>
              Phút / công thức (TB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Thời gian trung bình chuẩn bị + nấu của tất cả công thức.
            </p>
          </CardContent>
        </Card>

        <Card className='border-muted/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-b text-lg font-bold'>Hướng dẫn</CardTitle>
            <CardDescription className='text-muted-foreground'>
              Dành cho Quản trị viên
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-1 text-muted-foreground'>
            <p>
              1. <strong>Thêm công thức:</strong> Bấm nút dấu cộng góc phải.
            </p>
            <p>
              2. <strong>Chọn nguyên liệu:</strong> Tìm và chọn từ danh sách có sẵn.
            </p>
            <p>
              3. <strong>Bước nấu:</strong> Thêm từng bước theo trình tự.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách */}
      <RecipeTable columns={columns} data={recipes} ingredients={ingredients} userRole={currentUser.role} />

      {/* FAB */}
      <FloatingActionButtons ingredients={ingredients} userRole={currentUser.role} />
    </div>
  )
}
