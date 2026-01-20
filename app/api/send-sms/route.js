import { NextResponse } from 'next/server';
import { sendConfirmationSMS } from '@/lib/smsProvider';

export async function POST(request) {
  try {
    const { name, phone, orderId } = await request.json();

    if (!name || !phone || !orderId) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendConfirmationSMS(phone, name, orderId);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("SMS API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
