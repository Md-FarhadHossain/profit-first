import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.json()
    const { eventName, eventSourceUrl, userData, customData, eventId } = body

    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID
    const accessToken = process.env.FB_CONVERSION_API_TOKEN

    if (!pixelId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing Facebook credentials' },
        { status: 500 }
      )
    }

    // Hash user data for privacy
    const hashData = (data) => {
      if (!data) return undefined
      return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
    }

    // Prepare user data
    const hashedUserData = {}
    if (userData.email) hashedUserData.em = hashData(userData.email)
    if (userData.phone) hashedUserData.ph = hashData(userData.phone)
    if (userData.fbp) hashedUserData.fbp = userData.fbp
    if (userData.fbc) hashedUserData.fbc = userData.fbc

    // Send to Facebook Conversion API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_source_url: eventSourceUrl,
              user_data: hashedUserData,
              custom_data: customData,
              event_id: eventId,
              action_source: 'website',
            },
          ],
          access_token: accessToken,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Facebook API error:', result)
      return NextResponse.json(
        { error: 'Facebook API error', details: result },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}