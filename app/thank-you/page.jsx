  'use client'

  import { useEffect, Suspense } from 'react'
  import { useSearchParams } from 'next/navigation'
  import { trackEvent } from '@/lib/facebook-tracking'

  function ThankYouContent() {
    const searchParams = useSearchParams()
    
    useEffect(() => {
      // Get data from URL params
      const orderId = searchParams.get('orderId')
      const total = searchParams.get('total')
      const email = searchParams.get('email')
      const name = searchParams.get('name')
      const phone = searchParams.get('phone')
      const shipping = searchParams.get('shipping')
      const shippingCost = searchParams.get('shippingCost')

      // Only fire if we have order data
      if (orderId && total) {
        // Split name
        const nameParts = (name || '').split(' ')
        const firstName = nameParts[0] || 'Guest'
        const lastName = nameParts.slice(1).join(' ') || ''

        // Fire Purchase event
        trackEvent({
          eventName: 'Purchase',
          userData: {
            email: email || '',
            phone: phone || '',
            firstName: firstName,
            lastName: lastName,
            country: 'BD',
          },
          customData: {
            // Standard Facebook parameters
            value: parseFloat(total),
            currency: 'BDT',
            content_ids: ['973'],
            content_name: 'Profit First for F-Commerce',
            content_type: 'product',
            num_items: 1,
            
            // Contents array
            contents: [{
              id: '973',
              quantity: 1,
              item_price: 590
            }],
            
            // Custom parameters
            order_id: orderId,
            total: parseFloat(total),
            shipping: shipping || 'ঢাকার বাহিরে',
            shipping_cost: parseFloat(shippingCost || 99),
            category_name: 'Books',
            post_id: 913,
            post_type: 'product',
            user_role: 'guest',
            plugin: 'CustomPixel',
            average_order: 0,
            predicted_ltv: 0,
            transactions_count: 0,
          },
        })

        console.log('✅ Purchase event fired on Thank You page')
      }
    }, [searchParams])

    const orderId = searchParams.get('orderId')
    const total = searchParams.get('total')

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
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">অর্ডার নম্বর</p>
              <p className="text-2xl font-bold text-gray-800">#{orderId}</p>
            </div>
          )}
          
          {total && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">মোট মূল্য</p>
              <p className="text-2xl font-bold text-green-600">{total}৳</p>
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