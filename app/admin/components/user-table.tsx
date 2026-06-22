'use client'

import { columns } from './columns'
import { DataTable } from './data-table'
import { type User } from '../data/schema'

interface UserTableProps {
  data: User[]
}

export function UserTable({ data }: UserTableProps) {
  return (
    <div className='w-full'>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
