import EmailVerificationPage from '@/components/auth/VerifyEmailPage'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <Suspense>
        <EmailVerificationPage/>
    </Suspense>
  )
}
