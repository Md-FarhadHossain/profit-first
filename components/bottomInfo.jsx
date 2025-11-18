"use client"
import React, { useEffect } from 'react';

export default function HeroSection() {
  // Load Fonts and Icons
  useEffect(() => {
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

    const googleFonts = document.createElement('link');
    googleFonts.href = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap";
    googleFonts.rel = "stylesheet";
    document.head.appendChild(googleFonts);

    return () => {
      document.head.removeChild(fontAwesome);
      document.head.removeChild(googleFonts);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-[#495057] font-['Hind_Siliguri'] leading-[1.7]">
      {/* Custom Animation for the Scarcity Text */}
      <style>{`
        @keyframes pulse-orange {
          0% { transform: scale(1); text-shadow: 0 0 5px rgba(230, 81, 0, 0.3); }
          50% { transform: scale(1.03); text-shadow: 0 0 15px rgba(230, 81, 0, 0.5); }
          100% { transform: scale(1); text-shadow: 0 0 5px rgba(230, 81, 0, 0.3); }
        }
        .animate-pulse-orange {
          animation: pulse-orange 1.5s infinite;
        }
      `}</style>

      <header className="bg-white py-[30px] lg:py-[50px]">
        <div className="w-[90%] max-w-[1100px] mx-auto p-0 lg:grid lg:grid-cols-[45%_55%] lg:gap-[50px] lg:items-center">
          
          {/* --- Book Showcase (Left Column on Desktop) --- */}
          <div className="text-center px-2.5 mmb-5 lg:mb-0 lg:[grid-area:image]">
            <img 
              src="https://i.ibb.co.com/nNC0bmsw/with-background-Copy.webp" 
              alt="Book Cover" 
              className="w-full max-w-[300px] h-auto mx-auto mb-5 rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.03] block"
            />
            <a 
              href="#read" 
              className="inline-block w-full max-w-[300px] p-3 rounded-xl bg-[linear-gradient(45deg,#6842ff,#ff4ce1)] text-white no-underline font-semibold text-[1.1rem] shadow-[0_4px_10px_rgba(255,100,100,0.4)] transition-all duration-300 hover:-translate-y-0.5] hover:shadow-[0_6px_15px_rgba(255,100,100,0.5)] cursor-pointer text-center border-none"
            >
              কয়েকটি পৃষ্ঠা পড়ে দেখুন
            </a>
          </div>

          {/* --- Content (Right Column on Desktop) --- */}
          <div className="text-center px-0 lg:text-left lg:m-0 md:max-w-[600px] md:mx-auto lg:max-w-none lg:[grid-area:content]">
            
            <h1 className="text-[2.1rem] md:text-[2.5rem] text-[#343a40] mb-2.5 mt-5 lg:mt-0 text-left leading-[1.3]">
              প্রফিট ফার্স্ট ফর এফ-কমার্স বিজনেস <span className="text-[1.5rem] text-[#6b7280]">(হার্ড কভার)</span>
            </h1>

            {/* Reviews Box */}
            <div className="bg-[#FFFBEB] rounded-xl p-[15px] mb-5 inline-block border border-[#FFE5B4] w-full -mt-4">
              <div className="text-[#ffc107] text-[1.2rem] mb-[5px] flex justify-center lg:justify-start gap-1">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <p className="font-semibold text-[#856404] m-0">
                <strong>4.8 out of 5</strong> | <strong>১</strong>,৭০০+ পাঠক রিভিউ
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-[#F0FFF4] border-2 border-dashed border-[#28a745] rounded-[12px] p-5 mb-5 relative text-center lg:text-left">
              <div className="absolute -top-[15px] left-1/2 lg:left-[20%] -translate-x-1/2 bg-[#dc3545] text-white py-1.5 px-[15px] rounded-[20px] text-[1rem] font-bold shadow-[0_2px_5px_rgba(0,0,0,0.2)]">
                ২৫% ছাড়
              </div>
              <div className="flex justify-center lg:justify-start items-center gap-[15px] mt-[15px]">
                <span className="text-[3rem] font-bold text-[#28a745]">৳ ৪৯০</span>
                <span className="text-[1.8rem] line-through text-[#999]">৳ ৭৯০</span>
              </div>
            </div>

            {/* Stock Info */}
            <div className="bg-[linear-gradient(135deg,#fffde7,#fff3e0)] border-l-[5px] border-[#FFB74D] shadow-[0_5px_20px_rgba(255,183,77,0.25)] rounded-[0.75rem] p-5 mb-6 text-center max-w-[500px] w-full mx-auto lg:mx-0">
              <div className="text-[#15803D] font-semibold text-[1.25rem] lleading-7 mmb-2">
                ✅ স্টক সীমিত
              </div>
              <div className="animate-pulse-orange text-[#c2410c] font-bold text-[1.5rem] leading-8 mb-4">
                🔥দ্রুত করুন মাত্র <strong>৩</strong> কপি বই বাকি আছে!
              </div>
              <div className="text-[#1f2937] font-medium text-[1.25rem] lleading-7 mb-3">
                ⚡ অফার শেষ হয়ে যাবে দ্রুত করুন
              </div>
            </div>

            {/* CTA Button */}
            <a 
              href="#order" 
              className="inline-block w-full bg-[#FF6F61] text-white py-[18px] px-[30px] text-[1.3rem] font-bold no-underline rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,111,97,0.5)] cursor-pointer border-none hover:bg-[#E65C50] hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(255,111,97,0.6)] text-center"
            >
              <i className="fas fa-shopping-cart mr-2.5"></i> অর্ডার করতে এখানে ক্লিক করুন
            </a>

          </div>
        </div>
      </header>
    </div>
  );
}