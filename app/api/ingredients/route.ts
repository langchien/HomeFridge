import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(ingredients)
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nguyên liệu:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
