// components/FacebookPixel.js (Corrected version)
'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function FacebookPixel({ pixelId }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // This hook ONLY runs once to initialize the pixel
  useEffect(() => {
    const initPixel = async () => {
      const ReactPixel = (await import('react-facebook-pixel')).default
      ReactPixel.init(pixelId, undefined, {
        autoConfig: true,
        debug: false,
      })
    }
    
    initPixel()
  }, [pixelId])

  // This hook tracks page views on ALL route changes
  useEffect(() => {
    // A small delay to ensure init has run
    setTimeout(async () => {
      const ReactPixel = (await import('react-facebook-pixel')).default
      ReactPixel.pageView()
      console.log('✅ FB PageView Fired');
    }, 100);
  }, [pathname, searchParams]) // This will run on initial load AND route changes

  return null
}