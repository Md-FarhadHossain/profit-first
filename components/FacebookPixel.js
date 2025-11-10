'use client'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function FacebookPixelContent({ pixelId }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    let ReactPixel
    
    const initPixel = async () => {
      ReactPixel = (await import('react-facebook-pixel')).default
      ReactPixel.init(pixelId, undefined, {
        autoConfig: true,
        debug: false,
      })
      ReactPixel.pageView()
    }
    
    initPixel()
  }, [pixelId])
  
  useEffect(() => {
    const trackPageView = async () => {
      const ReactPixel = (await import('react-facebook-pixel')).default
      ReactPixel.pageView()
    }
    
    trackPageView()
  }, [pathname, searchParams])
  
  return null
}

export default function FacebookPixel({ pixelId }) {
  return (
    <Suspense fallback={null}>
      <FacebookPixelContent pixelId={pixelId} />
    </Suspense>
  )
}