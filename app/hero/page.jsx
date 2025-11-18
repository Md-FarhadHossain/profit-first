"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// --- GTM HELPER FUNCTION ---
const gtmEvent = (eventName, eventData = {}) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

// --- PRODUCT DETAILS ---
const PRODUCT_PRICE = 490;
const PRODUCT_ID = "973";
const PRODUCT_NAME = "Profit First for F-Commerce";
const PRODUCT_CATEGORY = "Books";
const CURRENCY = "BDT";
const POST_ID = 913;
const POST_TYPE = "product";

const HeroSection = () => {
  const [shipping, setShipping] = useState("outside-dhaka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [clientInfo, setClientInfo] = useState({ ip: null, userAgent: null });
  const sectionRef = useRef(null);
  const hasAddedToCart = useRef(false); // 🟢 Prevent multiple fires

  // --- INITIAL DATA FETCHING (Client Info & View Item) ---
  useEffect(() => {
    const ua = navigator.userAgent;

    const fetchIp = async () => {
      try {
        const response = await fetch("/api/ip");
        if (!response.ok) throw new Error("Failed to fetch IP");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Could not fetch IP:", error);
        return "0.0.0.0";
      }
    };

    const initializeTracking = async () => {
      const ip = await fetchIp();
      setClientInfo({ ip, userAgent: ua });

      // Fire view_item when page loads
      gtmEvent("view_item", {
        visitorIP: ip,
        browserName: ua,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [
            {
              item_id: PRODUCT_ID,
              item_name: PRODUCT_NAME,
              price: PRODUCT_PRICE,
              item_category: PRODUCT_CATEGORY,
              quantity: 1,
            },
          ],
        },
      });
      console.log("✅ view_item event fired to GTM");
    };

    initializeTracking();
  }, []);

  // 🟢 ADD_TO_CART Tracking when HeroSection becomes visible
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAddedToCart.current) {
            gtmEvent("add_to_cart", {
              visitorIP: clientInfo.ip,
              browserName: clientInfo.userAgent,
              ecommerce: {
                currency: CURRENCY,
                value: PRODUCT_PRICE,
                items: [
                  {
                    item_id: PRODUCT_ID,
                    item_name: PRODUCT_NAME,
                    price: PRODUCT_PRICE,
                    item_category: PRODUCT_CATEGORY,
                    quantity: 1,
                  },
                ],
              },
            });
            hasAddedToCart.current = true;
            console.log("🟢 add_to_cart event fired to GTM (HeroSection visible)");
          }
        });
      },
      { threshold: 0.5 } // fires when 50% of section visible
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [clientInfo]);

  // --- GTM ECOMMERCE EVENT HANDLERS ---
  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent("begin_checkout", {
        visitorIP: clientInfo.ip,
        browserName: clientInfo.userAgent,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [
            {
              item_id: PRODUCT_ID,
              item_name: PRODUCT_NAME,
              price: PRODUCT_PRICE,
              item_category: PRODUCT_CATEGORY,
              quantity: 1,
            },
          ],
        },
      });
      setCheckoutStarted(true);
      console.log("✅ begin_checkout event fired to GTM");
    }
  };

  // --- MODIFIED ORDER HANDLER ---
  const handleOrder = async (event) => {
    event.preventDefault();
    if (isSubmitting || !clientInfo.ip) {
      alert("Please wait a moment while we prepare everything...");
      return;
    }
    setIsSubmitting(true);

    // 1. Gather all data from form and state
    const name = event.target.name.value;
    const number = event.target.billing_phone.value;
    const address = event.target.billing_address_1.value;

    const shippingCost = shipping === "outside-dhaka" ? 99.0 : 60.0;
    const shippingMethod =
      shipping === "outside-dhaka" ? " ঢাকার বাহিরে" : " ঢাকার ভিতরে";
      
    const totalValue = PRODUCT_PRICE + shippingCost;

    // 2. Construct the data object for the API
    const orderData = {
      name,
      number,
      address,
      shipping: shippingMethod,
      shippingCost,
      totalValue,
      status: "Processing", // Initial status
      items: [
        {
          item_id: PRODUCT_ID,
          item_name: PRODUCT_NAME,
          price: PRODUCT_PRICE,
          item_category: PRODUCT_CATEGORY,
          quantity: 1,
        },
      ],
      clientInfo: {
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
      },
      currency: CURRENCY,
      postId: POST_ID.toString(),
      postType: POST_TYPE,
      createdAt: new Date().toISOString(), // Add timestamp
    };

    try {
      // 3. POST data to your MongoDB server
      const response = await fetch("https://profit-first-server.vercel.app/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        // Handle server-side errors
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit order.");
      }

      // 4. Get the new order data from the response
      const result = await response.json();
      
      // Get the real Order ID from the server response.
      // Adjust this based on your actual server response structure.
      const newOrderId = result.orderId || result._id || result.insertedId || `db_${new Date().getTime()}`;

      console.log("✅ Order posted to server successfully:", result);

      // 5. If successful, redirect to Thank You page with REAL data
      const params = new URLSearchParams({
        orderId: newOrderId, // Use the REAL order ID from server
        total: totalValue.toString(),
        shippingCost: shippingCost.toString(),
        currency: CURRENCY,
        productId: PRODUCT_ID,
        productName: PRODUCT_NAME,
        categoryName: PRODUCT_CATEGORY,
        price: PRODUCT_PRICE.toString(),
        quantity: "1",
      });

      window.location.href = `/thank-you?${params.toString()}`;

    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("There was a problem with your order. Please try again. " + error.message);
    } finally {
      // 6. Re-enable the button
      setIsSubmitting(false);
    }
  };
  
  const calculatedTotal =
    PRODUCT_PRICE + (shipping === "outside-dhaka" ? 99 : 60);

  return (
    <section id="order" name="order" ref={sectionRef} className="bg-gray-100 px-2 shadow-2xl border">
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
              onFocus={handleBeginCheckout}
              disabled={isSubmitting}
            />
            <Input
              placeholder="Number (মোবাইল নম্বর)"
              name="billing_phone"
              required
              type="tel"
              minLength={11}
              maxLength={16}
              // pattern="[0-9]{11}"
              className="py-6"
              onFocus={handleBeginCheckout}
              disabled={isSubmitting}
              autoComplete="tel"
            />
          </div>

          <Input
            className="py-6"
            placeholder="Address (সম্পূর্ণ ঠিকানা)"
            name="billing_address_1"
            required
            type="text"
            onFocus={handleBeginCheckout}
            disabled={isSubmitting}
            autoComplete="billing_address_1"
            aria-required="true"
            id="billing_address_1"
          />

          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">
              Shipping (শিপিং চার্জ)
            </h2>
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
            {isSubmitting ? "অর্ডার করা হচ্ছে..." : `অর্ডার করুন ${calculatedTotal}৳`}
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