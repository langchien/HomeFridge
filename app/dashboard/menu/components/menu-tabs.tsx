'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DailyMenuList } from './daily-menu-list'
import { RecipeTable } from './recipe-table'
import { MenuRequestsPanel } from './menu-requests-panel'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, ChefHat, MessageSquare } from 'lucide-react'
import type {
  DailyMenu,
  DailyMenuItem,
  Recipe,
  RecipeIngredient,
  MenuRequest,
  User,
} from '@/generated/prisma/client'
import type { RecipeWithIngredients } from './recipe-form-dialog'

type MenuItemWithRecipe = DailyMenuItem & {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}
type DailyMenuWithItems = DailyMenu & { items: MenuItemWithRecipe[] }
type MenuRequestWithRelations = MenuRequest & {
  user: Pick<User, 'id' | 'name' | 'avatar'>
  recipe: Recipe | null
}

interface MenuTabsProps {
  menus: DailyMenuWithItems[]
  recipes: RecipeWithIngredients[]
  requests: MenuRequestWithRelations[]
}

export function MenuTabs({ menus, recipes, requests }: MenuTabsProps) {
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <Tabs defaultValue='menu' className='flex flex-col gap-4'>
      <TabsList className='w-fit'>
        <TabsTrigger value='menu' className='gap-2'>
          <CalendarDays className='h-4 w-4' />
          Thực đơn
          <Badge variant='secondary' className='ml-1'>
            {menus.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value='recipes' className='gap-2'>
          <ChefHat className='h-4 w-4' />
          Công thức
          <Badge variant='secondary' className='ml-1'>
            {recipes.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value='requests' className='gap-2'>
          <MessageSquare className='h-4 w-4' />
          Yêu cầu
          {pendingCount > 0 && (
            <Badge className='ml-1 bg-amber-500 text-white'>{pendingCount}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value='menu' className='mt-0'>
        <DailyMenuList menus={menus} recipes={recipes} />
      </TabsContent>

      <TabsContent value='recipes' className='mt-0'>
        <RecipeTable recipes={recipes} />
      </TabsContent>

      <TabsContent value='requests' className='mt-0'>
        <MenuRequestsPanel requests={requests} />
      </TabsContent>
    </Tabs>
  )
}
