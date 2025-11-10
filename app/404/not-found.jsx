'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function NotFoundContent() {
  const searchParams = useSearchParams()
  
  // Your existing 404 page code here
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p>Page Not Found</p>
      </div>
    </div>
  )
}

export default function Custom404() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
}