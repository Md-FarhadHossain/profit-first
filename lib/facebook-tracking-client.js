'use client'

import ReactPixel from 'react-facebook-pixel'

function generateEventId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getFacebookCookies() {
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
  const eventId = generateEventId()
  
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