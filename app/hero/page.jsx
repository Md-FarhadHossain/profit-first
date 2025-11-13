"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// --- GTM HELPER FUNCTION ---
const gtmEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

// --- PRODUCT DETAILS ---
const PRODUCT_PRICE = 590;
const PRODUCT_ID = '973';
const PRODUCT_NAME = 'Profit First for F-Commerce';
const PRODUCT_CATEGORY = 'Books';
const CURRENCY = 'BDT';
const POST_ID = 913;
const POST_TYPE = 'product';

const HeroSection = () => {
  const [shipping, setShipping] = useState("outside-dhaka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    ip: null,
    userAgent: null,
  });
  const sectionRef = useRef(null);

  // --- INITIAL DATA FETCHING (Client Info & View Item) ---
  useEffect(() => {
    const ua = navigator.userAgent;

    const fetchIp = async () => {
      try {
        // This assumes you have an API route at /api/ip to get the user's IP address.
        const response = await fetch('/api/ip');
        if (!response.ok) throw new Error('Failed to fetch IP');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Could not fetch IP:", error);
        return '0.0.0.0'; // Fallback IP
      }
    };

    const initializeTracking = async () => {
      const ip = await fetchIp();
      setClientInfo({ ip, userAgent: ua });

      // Fire view_item event when the component mounts
      gtmEvent('view_item', {
        visitorIP: ip,
        browserName: ua,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [{
            item_id: PRODUCT_ID,
            item_name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            item_category: PRODUCT_CATEGORY,
            quantity: 1
          }]
        }
      });
      console.log('✅ view_item event fired to GTM');
    };

    initializeTracking();
  }, []);

  // --- GTM ECOMMERCE EVENT HANDLERS ---
  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent('begin_checkout', {
        visitorIP: clientInfo.ip,
        browserName: clientInfo.userAgent,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [{
            item_id: PRODUCT_ID,
            item_name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            item_category: PRODUCT_CATEGORY,
            quantity: 1
          }]
        }
      });
      setCheckoutStarted(true);
      console.log('✅ begin_checkout event fired to GTM');
    }
  };

  const handleOrder = async (event) => {
    event.preventDefault();
    if (isSubmitting || !clientInfo.ip) {
      alert('Please wait a moment while we prepare everything...');
      return;
    }
    setIsSubmitting(true);

    const name = event.target.name.value;
    const number = event.target.billing_phone.value;
    const address = event.target.address.value;

    const shippingCost = shipping === "outside-dhaka" ? 99.00 : 60.00;
    const shippingMethod = shipping === "outside-dhaka" ? " ঢাকার বাহিরে" : " ঢাকার ভিতরে";
    const totalValue = PRODUCT_PRICE + shippingCost;

    const userDataForBackend = {
      name,
      number,
      address,
      shippingMethod,
      shippingCost,
      totalValue,
      productId: PRODUCT_ID,
      currency: CURRENCY,
    };

    try {
      // This is where you would typically send the order to your backend.
      // We are simulating a successful order for this example.
      // const makeOrder = await fetch(`http://localhost:5000/orders`, { ... });
      // const orderJson = await makeOrder.json();
      
      const simulatedOrderId = `order_${new Date().getTime()}`;
      console.log("✅ Your order is placed! (Simulated)");

      // Fire the purchase event to GTM
      gtmEvent('purchase', {
        visitorIP: clientInfo.ip,
        browserName: clientInfo.userAgent,
        ecommerce: {
          currency: CURRENCY,
          transaction_id: simulatedOrderId,
          value: totalValue,
          shipping: shippingCost,
          items: [{
            item_id: PRODUCT_ID,
            item_name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            item_category: PRODUCT_CATEGORY,
            quantity: 1
          }]
        }
      });
      console.log('✅ purchase event fired to GTM');

      // --- [START] REDIRECT TO THANK YOU PAGE ---
      // We send all necessary data to the thank-you page via URL parameters
      const params = new URLSearchParams({
        orderId: simulatedOrderId,
        total: totalValue.toString(),
        shippingCost: shippingCost.toString(),
        currency: CURRENCY,
        productId: PRODUCT_ID,
        productName: PRODUCT_NAME,
        categoryName: PRODUCT_CATEGORY,
        price: PRODUCT_PRICE.toString(),
        quantity: '1',
      });
      
      window.location.href = `/thank-you?${params.toString()}`;
      // --- [END] REDIRECT TO THANK YOU PAGE ---

    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("There was a problem with your order. Please try again.");
    } finally {
      // This part might not be reached if the redirect happens,
      // but it's good practice for error handling.
      setIsSubmitting(false);
    }
  };

  const calculatedTotal = PRODUCT_PRICE + (shipping === "outside-dhaka" ? 99 : 60);

  return (
    <section ref={sectionRef} className="bg-gray-100 px-2 shadow-2xl border">
      <div className="bg-white px-2 py-8">
        <h1 className="text-4xl text-center mb-8 font-bold">
          বইটি অর্ডার করতে নিচের ফর্মটি পূরণ করুন
        </h1>
        
        <form onSubmit={handleOrder} className="grid gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              className="py-6"
              placeholder="Name (আপনার নাম)"
              name="name"
              required
              type="text"
              onFocus={handleBeginCheckout} // Fire begin_checkout when user starts filling the form
              disabled={isSubmitting}
            />
            <Input
              placeholder="Number (মোবাইল নম্বর)"
              name="billing_phone"
              required
              type="tel"
              minLength={11}
              maxLength={11}
              pattern="[0-9]{11}"
              className="py-6"
              onFocus={handleBeginCheckout}
              disabled={isSubmitting}
            />
          </div>

          <Input
            className="py-6"
            placeholder="Address (সম্পূর্ণ ঠিকানা)"
            name="address"
            required
            type="text"
            onFocus={handleBeginCheckout}
            disabled={isSubmitting}
          />

          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">Shipping (শিপিং চার্জ)</h2>
            <RadioGroup
              value={shipping}
              onValueChange={setShipping}
              className="border rounded-lg"
              disabled={isSubmitting}
            >
              <Label
                htmlFor="outside-dhaka"
                className={`flex items-center justify-between p-4 border-b cursor-pointer text-xl transition-colors hover:bg-muted/50 ${
                  shipping === "outside-dhaka" ? "bg-muted" : ""
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="outside-dhaka" 
                    id="outside-dhaka"
                    disabled={isSubmitting}
                  />
                  <span className="text-2xl">ঢাকার বাহিরে:</span>
                </div>
                <span className="font-medium">99.00৳</span>
              </Label>

              <Label
                htmlFor="inside-dhaka"
                className={`flex items-center justify-between p-4 cursor-pointer text-xl transition-colors hover:bg-muted/50 ${
                  shipping === "inside-dhaka" ? "bg-muted" : ""
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value="inside-dhaka" 
                    id="inside-dhaka"
                    disabled={isSubmitting}
                  />
                  <span className="text-2xl">ঢাকার ভিতরে:</span>
                </div>
                <span className="font-medium">60.00৳</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">বই মূল্য:</span>
              <span className="text-lg font-medium">{PRODUCT_PRICE}৳</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">শিপিং চার্জ:</span>
              <span className="text-lg font-medium">
                {shipping === "outside-dhaka" ? "99" : "60"}৳
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">মোট:</span>
                <span className="text-xl font-bold text-green-600">
                  {calculatedTotal}৳
                </span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full py-6 text-2xl font-bold"
            type="submit"
            disabled={isSubmitting || !clientInfo.ip}
          >
            {isSubmitting ? "অর্ডার করা হচ্ছে..." : "অর্ডার করুন"}
          </Button>
        </form>

        <div className="text-center mt-6 text-gray-600">
          <p>✅ ক্যাশ অন ডেলিভারি সুবিধা</p>
          <p>✅ সারাদেশে হোম ডেলিভারি</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;