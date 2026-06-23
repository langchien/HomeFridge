'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'

const chartConfig = {
  fresh: { label: 'Tươi mới', color: 'hsl(var(--chart-2))' },
  expiring: { label: 'Sắp hết hạn', color: 'hsl(var(--chart-4))' },
  expired: { label: 'Đã hỏng', color: 'hsl(var(--destructive))' },
}

export function DashboardChartClient({ data }: { data: any[] }) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div className='flex h-[250px] items-center justify-center text-sm text-muted-foreground'>
        Chưa có dữ liệu nguyên liệu trong tủ lạnh
      </div>
    )
  }

  return (
    <div className='h-[250px]'>
      <ChartContainer config={chartConfig} className='h-full w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign='bottom' height={36} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
