import bizSdk from 'facebook-nodejs-business-sdk'

const access_token = process.env.FACEBOOK_ACCESS_TOKEN
const pixel_id = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

const ServerEvent = bizSdk.ServerEvent
const EventRequest = bizSdk.EventRequest
const UserData = bizSdk.UserData
const CustomData = bizSdk.CustomData

export async function trackServerEvent({
  eventName,
  eventSourceUrl,
  userData = {},
  customData = {},
  eventId = null
}) {
  try {
    const api = bizSdk.FacebookAdsApi.init(access_token)
    
    // User Data
    const user_data = new UserData()
    
    if (userData.email) {
      user_data.setEmails([userData.email])
    }
    if (userData.phone) {
      user_data.setPhones([userData.phone])
    }
    if (userData.firstName) {
      user_data.setFirstNames([userData.firstName])
    }
    if (userData.lastName) {
      user_data.setLastNames([userData.lastName])
    }
    if (userData.city) {
      user_data.setCities([userData.city])
    }
    if (userData.state) {
      user_data.setStates([userData.state])
    }
    if (userData.zip) {
      user_data.setZipCodes([userData.zip])
    }
    if (userData.country) {
      user_data.setCountryCodes([userData.country])
    }
    if (userData.clientIpAddress) {
      user_data.setClientIpAddress(userData.clientIpAddress)
    }
    if (userData.clientUserAgent) {
      user_data.setClientUserAgent(userData.clientUserAgent)
    }
    if (userData.fbc) {
      user_data.setFbc(userData.fbc)
    }
    if (userData.fbp) {
      user_data.setFbp(userData.fbp)
    }

    // Custom Data
    const custom_data = new CustomData()
    
    if (customData.value) {
      custom_data.setValue(customData.value)
    }
    if (customData.currency) {
      custom_data.setCurrency(customData.currency)
    }
    if (customData.contentName) {
      custom_data.setContentName(customData.contentName)
    }
    if (customData.contentIds) {
      custom_data.setContentIds(customData.contentIds)
    }
    if (customData.contentType) {
      custom_data.setContentType(customData.contentType)
    }
    if (customData.contents) {
      custom_data.setContents(customData.contents)
    }

    // Server Event
    const server_event = new ServerEvent()
    server_event.setEventName(eventName)
    server_event.setEventTime(Math.floor(Date.now() / 1000))
    server_event.setUserData(user_data)
    server_event.setCustomData(custom_data)
    server_event.setEventSourceUrl(eventSourceUrl)
    server_event.setActionSource('website')
    
    if (eventId) {
      server_event.setEventId(eventId)
    }

    // Send Event
    const eventsData = [server_event]
    const eventRequest = new EventRequest(access_token, pixel_id)
    eventRequest.setEvents(eventsData)

    const response = await eventRequest.execute()
    
    return { success: true, response }
  } catch (error) {
    console.error('Facebook Conversion API Error:', error)
    return { success: false, error: error.message }
  }
}