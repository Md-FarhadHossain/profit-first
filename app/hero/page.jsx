"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trackEvent } from '@/lib/facebook-tracking'; // Make sure this path is correct

// --- PRODUCT DETAILS ---
const PRODUCT_PRICE = 590;
const PRODUCT_ID = '973';
const PRODUCT_NAME = 'Profit First for F-Commerce'; // Add your book name
const PRODUCT_CATEGORY = 'Books';
const CURRENCY = 'BDT';
const POST_ID = 913;
const POST_TYPE = 'product';

const HeroSection = () => {
  const [shipping, setShipping] = useState("outside-dhaka");
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [hasTrackedAddToCart, setHasTrackedAddToCart] = useState(false);
const sectionRef = useRef(null);

// --- [START] REPLACED useEffect ---
  // This effect now watches the section and fires when it becomes visible
  useEffect(() => {
    // Get the DOM element from the ref
    const currentRef = sectionRef.current;
    // Don't do anything if the ref isn't attached yet
    if (!currentRef) return;

    // Create the observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting is true when the element is in the viewport
        // We also check !hasTrackedAddToCart to ensure it only fires ONCE
        if (entry.isIntersecting && !hasTrackedAddToCart) {
          setHasTrackedAddToCart(true); // Mark as tracked

          // Small delay to ensure pixel is initialized (your original logic)
          setTimeout(() => {
            trackEvent({
              eventName: 'AddToCart',
              customData: {
                value: PRODUCT_PRICE,
                currency: CURRENCY,
                content_ids: [PRODUCT_ID],
                content_name: PRODUCT_NAME,
                content_type: 'product',
                num_items: 1,
                contents: [{
                  id: PRODUCT_ID,
                  quantity: 1,
                  item_price: PRODUCT_PRICE
                }],
                category_name: PRODUCT_CATEGORY,
                post_id: POST_ID,
                post_type: POST_TYPE,
              },
            })
            
            console.log('✅ AddToCart event fired on SECTION VIEW')
          }, 1000)

          // Stop observing once we've fired the event
          observer.unobserve(currentRef);
        }
      },
      { 
        threshold: 0.1 // Fire when 10% of the section is visible
      } 
    );

    // Start observing the section
    observer.observe(currentRef);

    // Cleanup function: stop observing when the component unmounts
    return () => {
      observer.unobserve(currentRef);
    };
  }, [hasTrackedAddToCart]); // Dependency array
 // --- [END] REPLACED useEffect ---

  const handleOrder = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // --- GET FORM DATA ---
    const name = event.target.name.value;
    const number = event.target.billing_phone.value;
    const address = event.target.address.value;

    // --- CALCULATE SHIPPING ---
    const shippingCost = shipping === "outside-dhaka" ? 99.00 : 60.00;
    const shippingMethod = shipping === "outside-dhaka" ? "ঢাকার বাহিরে" : " ঢাকার ভিতরে";
    const totalValue = PRODUCT_PRICE + shippingCost;

    // --- DATA FOR BACKEND ---
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

    console.log("Sending data to backend:", userDataForBackend);

    try {
      const makeOrder = await fetch(`http://localhost:5000/orders`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(userDataForBackend),
      });

      const orderJson = await makeOrder.json();

      if (orderJson.acknowledged) {
        console.log("✅ Your order is placed!");

        // --- [START] UPDATED REDIRECT CODE ---
        // We send ALL data to the thank-you page via URL parameters
        const params = new URLSearchParams({
          // Order details
          orderId: orderJson.orderId || orderJson.insertedId || 'N/A',
          total: totalValue.toString(),
          shipping: shippingMethod,
          shippingCost: shippingCost.toString(),
          
          // User details
          name: name, // We'll split this into 'firstName' on the next page
          phone: number,

          // Product details
          productId: PRODUCT_ID,
          productName: PRODUCT_NAME,
          categoryName: PRODUCT_CATEGORY,
          price: PRODUCT_PRICE.toString(),
          quantity: '1', // Assuming quantity is always 1 for this form
          currency: CURRENCY,
          postId: POST_ID.toString(),
          postType: POST_TYPE,
        });
        
        window.location.href = `/thank-you?${params.toString()}`;
        // --- [END] UPDATED REDIRECT CODE ---

      } else {
        console.error("❌ Order failed at backend:", orderJson.message);
        alert("অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      alert("অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total based on shipping
  const calculatedTotal = PRODUCT_PRICE + (shipping === "outside-dhaka" ? 99 : 60);

  return (
    <section ref={sectionRef} className="bg-gray-100 px-2 shadow-2xl border">
      {/* ... (The rest of your form HTML is unchanged) ... */}
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
              disabled={isSubmitting}
            />
          </div>

          <Input
            className="py-6"
            placeholder="Address (সম্পূর্ণ ঠিকানা)"
            name="address"
            required
            type="text"
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

          {/* Total Display */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">বই মূল্য:</span>
              <span className="text-lg font-medium">{PRODUCT_PRICE}৳</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">শিপিং চার্জ:</span>
              <span className="text-lg font-medium">
                {shipping === "outside-dhaka" ? "99" : "60"}৳
              </span>        </div>
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
            disabled={isSubmitting}
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