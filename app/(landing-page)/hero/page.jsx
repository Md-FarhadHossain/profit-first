"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { XCircle, MessageCircle, Facebook } from "lucide-react"; // Ensure you have lucide-react installed

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
  
  // 🆕 New State for Duplicate Order Modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  const sectionRef = useRef(null);
  const hasAddedToCart = useRef(false); 

  // --- INITIAL DATA FETCHING ---
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

      gtmEvent("view_item", {
        visitorIP: ip,
        browserName: ua,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [{ item_id: PRODUCT_ID, item_name: PRODUCT_NAME, price: PRODUCT_PRICE, item_category: PRODUCT_CATEGORY, quantity: 1 }],
        },
      });
    };

    initializeTracking();
  }, []);

  // --- ADD_TO_CART Tracking ---
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
                items: [{ item_id: PRODUCT_ID, item_name: PRODUCT_NAME, price: PRODUCT_PRICE, item_category: PRODUCT_CATEGORY, quantity: 1 }],
              },
            });
            hasAddedToCart.current = true;
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [clientInfo]);

  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent("begin_checkout", {
        visitorIP: clientInfo.ip,
        browserName: clientInfo.userAgent,
        ecommerce: {
          currency: CURRENCY,
          value: PRODUCT_PRICE,
          items: [{ item_id: PRODUCT_ID, item_name: PRODUCT_NAME, price: PRODUCT_PRICE, item_category: PRODUCT_CATEGORY, quantity: 1 }],
        },
      });
      setCheckoutStarted(true);
    }
  };

  // --- MODIFIED ORDER HANDLER ---
  const handleOrder = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const name = event.target.name.value;
      const number = event.target.billing_phone.value;
      const address = event.target.billing_address_1.value;
      const shippingCost = shipping === "outside-dhaka" ? 99.0 : 60.0;
      const shippingMethod = shipping === "outside-dhaka" ? "ঢাকার বাহিরে" : "ঢাকার ভিতরে";
      const totalValue = PRODUCT_PRICE + shippingCost;

      const orderData = {
        name,
        number,
        address,
        shipping: shippingMethod,
        shippingCost,
        totalValue,
        status: "Processing",
        phoneCallStatus: "Pending",
        items: [{ item_id: PRODUCT_ID, item_name: PRODUCT_NAME, price: PRODUCT_PRICE, item_category: PRODUCT_CATEGORY, quantity: 1 }],
        clientInfo: { ip: clientInfo.ip, userAgent: clientInfo.userAgent },
        currency: CURRENCY,
        postId: POST_ID.toString(),
        postType: POST_TYPE,
      };

      // POST to Server
      const response = await fetch("https://profit-first-server.vercel.app/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      // 🆕 CHECK FOR DUPLICATE ORDER FLAG FROM SERVER
      if (response.status === 409 || result.reason === "active_order_exists") {
        console.warn("Duplicate order detected");
        setShowDuplicateModal(true); // Show the popup
        setIsSubmitting(false);      // Stop loading
        return;                      // STOP here, do not redirect
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit order.");
      }

      // Success - Redirect
      const params = new URLSearchParams({
        orderId: result.orderId.toString(),
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
      alert("Order Failed: " + error.message);
    } finally {
        // Only set submitting false if we didn't redirect (e.g. error or duplicate)
        // If success, we leave it true to prevent double clicks while redirecting
        if(showDuplicateModal) setIsSubmitting(false);
    }
  };
  
  const calculatedTotal = PRODUCT_PRICE + (shipping === "outside-dhaka" ? 99 : 60);

  return (
    <section id="order" name="order" ref={sectionRef} className="bg-gray-100 px-2 shadow-2xl border relative">
      
      {/* 🆕 DUPLICATE ORDER MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowDuplicateModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <XCircle size={28} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <MessageCircle size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              আপনার একটি অর্ডার ইতিমধ্যে প্রসেসিং এ আছে!
            </h2>
            <p className="text-gray-600 mb-6">
              আপনি যদি ভুলে ভুল তথ্য দিয়ে থাকেন বা তথ্য পরিবর্তন করতে চান, দয়া করে নতুন অর্ডার না করে আমাদের সাথে সরাসরি যোগাযোগ করুন।
            </p>

            <div className="space-y-3">
              <a 
                href="https://wa.me/8801931692180" // REPLACE WITH YOUR NUMBER
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
              >
                <MessageCircle size={20} />
                WhatsApp এ মেসেজ দিন
              </a>
              
              <a 
                href="https://www.facebook.com/fb.uddokta" // REPLACE WITH YOUR PAGE USERNAME
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                <Facebook size={20} />
                Facebook এ মেসেজ দিন
              </a>
            </div>

            <button 
              onClick={() => setShowDuplicateModal(false)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

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
            id="billing_address_1"
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
                  <RadioGroupItem value="outside-dhaka" id="outside-dhaka" disabled={isSubmitting} />
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
                  <RadioGroupItem value="inside-dhaka" id="inside-dhaka" disabled={isSubmitting} />
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
            {isSubmitting ? "অর্ডার প্রসেসিং..." : `অর্ডার করুন ${calculatedTotal}৳`}
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