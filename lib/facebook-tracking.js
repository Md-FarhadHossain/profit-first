'use client'

// Generate event ID for deduplication
function generateEventId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get Facebook cookies
function getFacebookCookies() {
  if (typeof document === 'undefined') return { fbp: undefined, fbc: undefined }
  
  const cookies = document.cookie.split(';')
  const fbp = cookies.find(c => c.trim().startsWith('_fbp='))?.split('=')[1]
  const fbc = cookies.find(c => c.trim().startsWith('_fbc='))?.split('=')[1]
  
  return { fbp, fbc }
}

export async function trackEvent({
  eventName,
  userData = {},
  customData = {},
  sendToServer = true
}) {
  // Only run in browser environment
  if (typeof window === 'undefined') return
  
  const eventId = generateEventId()
  
  // Dynamic import of ReactPixel
  const ReactPixel = (await import('react-facebook-pixel')).default
  
  // Track on client (browser pixel)
  ReactPixel.track(eventName, customData, { eventID: eventId })

  // Track on server (Conversion API)
  if (sendToServer) {
    const { fbp, fbc } = getFacebookCookies()
    
    try {
      await fetch('/api/facebook-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          eventSourceUrl: window.location.href,
          userData: {
            ...userData,
            fbp,
            fbc
          },
          customData,
          eventId
        })
      })
    } catch (error) {
      console.error('Failed to send server event:', error)
    }
  }
}