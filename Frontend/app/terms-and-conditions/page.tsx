import TermsAndConditions from '@/components/TearmsAndConditions'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <div><Suspense><TermsAndConditions/></Suspense></div>
  )
}
