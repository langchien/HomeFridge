import { Suspense } from 'react'
import { LoginForm } from '@/components/form/login-form'

export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Suspense
        fallback={
          <div className='flex min-h-screen items-center justify-center bg-background'>
            <div className='h-8 w-8 animate-spin rounded-full border-t-2 border-primary'></div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
