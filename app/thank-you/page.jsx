'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// --- GTM HELPER FUNCTION ---
const gtmEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

function ThankYouContent() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // --- Get all data from URL parameters ---
    const orderId = searchParams.get('orderId');
    const total = searchParams.get('total');
    const shippingCost = searchParams.get('shippingCost');
    const currency = searchParams.get('currency');
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const categoryName = searchParams.get('categoryName');
    const price = searchParams.get('price');
    const quantity = searchParams.get('quantity');

    // --- Fire GTM Purchase event only if we have the necessary data ---
    if (orderId && total) {
      const totalValue = parseFloat(total);
      const shippingValue = parseFloat(shippingCost || '0');
      const itemPrice = parseFloat(price || '0');
      const itemQuantity = parseInt(quantity || '1', 10);

      gtmEvent('purchase', {
        ecommerce: {
          currency: currency || 'BDT',
          transaction_id: orderId,
          value: totalValue,
          shipping: shippingValue,
          items: [{
            item_id: productId,
            item_name: productName,
            price: itemPrice,
            item_category: categoryName,
            quantity: itemQuantity
          }]
        }
      });

      console.log('✅ GTM Purchase event fired on Thank You page');
    }
  }, [searchParams]);

  // --- Data for displaying on the page ---
  const displayOrderId = searchParams.get('orderId');
  const displayTotal = searchParams.get('total');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          অর্ডার সফল হয়েছে! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
        </p>
        
        {displayOrderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">অর্ডার নম্বর</p>
            <p className="text-2xl font-bold text-gray-800">#{displayOrderId}</p>
          </div>
        )}
        
        {displayTotal && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">মোট মূল্য</p>
            <p className="text-2xl font-bold text-green-600">{displayTotal}৳</p>
          </div>
        )}
        
        <div className="border-t pt-6 mt-6">
          <p className="text-gray-600 mb-4">
            আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
          <p className="text-sm text-gray-500">
            ✅ ক্যাশ অন ডেলিভারি<br/>
            ✅ ২-৩ কর্মদিবসে ডেলিভারি
          </p>
        </div>
        
        <a  href="/"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          হোম পেজে ফিরে যান
        </a>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}