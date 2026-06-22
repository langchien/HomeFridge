'use client'

import { useState } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { type User } from '../data/schema'
import { UserFormDialog } from './user-form-dialog'
import { ResetPasswordDialog } from './reset-password-dialog'

interface UserTableProps {
  data: User[]
}

export function UserTable({ data }: UserTableProps) {
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)

  const handleAdd = () => {
    setSelectedUser(null)
    setIsAddEditOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsAddEditOpen(true)
  }

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user)
    setIsResetPasswordOpen(true)
  }

  return (
    <div className='w-full'>
      <DataTable
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
      />

      <UserFormDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        user={selectedUser}
        onSuccess={() => {}}
      />

      <ResetPasswordDialog
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        user={resetPasswordUser}
        onSuccess={() => {}}
      />
    </div>
  )
}
