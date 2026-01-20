'use server'

export async function checkFraudResult(phoneNumber: string) {
  const apiKey = process.env.FRAUD_API_KEY;
  const apiUrl = process.env.FRAUD_API_URL;

  if (!apiKey || !apiUrl) {
    return { success: false, message: 'API Configuration Error' };
  }

  try {
    // The API documentation requests FormData
    const formData = new FormData();
    formData.append('phone', phoneNumber);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Do not set Content-Type manually when using FormData, 
        // fetch handles the boundary automatically.
      },
      body: formData,
      cache: 'no-store' // Ensure we get fresh data every time
    });

    if (!response.ok) {
      return { success: false, message: `API Error: ${response.status}` };
    }

    const data = await response.json();
    
    // Return the data structured nicely for your frontend
    return { success: true, data: data };

  } catch (error) {
    console.error("Fraud Check Error:", error);
    return { success: false, message: 'Failed to connect to fraud checker' };
  }
}