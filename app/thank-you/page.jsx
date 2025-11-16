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

  // Replace with your actual Facebook group URL
  const FACEBOOK_GROUP_URL = 'https://www.facebook.com/groups/YOUR_GROUP_ID';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Success Icon */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <svg
            className="mx-auto h-16 w-16 text-green-500 relative z-10"
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
        
        {/* Thank You Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          অর্ডার সফল হয়েছে! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-6 text-center">
          আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
        </p>
        
        {/* Order Details */}
        <div className="space-y-3 mb-6">
          {/* {displayOrderId && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">অর্ডার নম্বর</p>
              <p className="text-2xl font-bold text-gray-800">#{displayOrderId}</p>
            </div>
          )} */}
          
          {displayTotal && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-gray-500 mb-1">মোট মূল্য</p>
              <p className="text-2xl font-bold text-green-600">{displayTotal}৳</p>
            </div>
          )}
        </div>
        
        {/* Delivery Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <p className="text-gray-700 font-medium mb-3 text-center">
            আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span>২-৩ কর্মদিবসে ডেলিভারি</span>
            </div>
          </div>
        </div>

        {/* Facebook Community Section - NEW */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-3">
              {/* Facebook Icon */}
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">
              আমাদের কমিউনিটিতে যোগ দিন! 🌟
            </h3>
            
            <p className="text-blue-100 text-center text-sm mb-4">
              বিশেষ অফার, টিপস এবং আপডেট পেতে আমাদের Facebook কমিউনিটির সদস্য হন
            </p>
            
            <a
              href={FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                কমিউনিটিতে যুক্ত হন
              </span>
            </a>
          </div>
        </div>
        
        {/* Home Button */}
        <a
          href="/"
          className="block w-full bg-gray-800 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors text-center"
        >
          হোম পেজে ফিরে যান
        </a>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}