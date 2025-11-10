'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function FacebookPixel({ pixelId }) {
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