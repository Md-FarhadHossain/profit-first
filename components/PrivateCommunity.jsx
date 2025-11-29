"use client"
import React from 'react';
import { Users, ArrowRight, Star, ThumbsUp, Facebook, Quote, BadgeCheck } from 'lucide-react';

// Data moved outside component for better performance
const entrepreneurs = [
  {
    id: 1,
    pageName: "Sukher Khamar - সুখের খামার",
    pageLogo: "https://scontent.fjsr17-1.fna.fbcdn.net/v/t39.30808-6/491099432_122188109366263546_3813264847492246776_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=4kSPLphehB4Q7kNvwE0fGf6&_nc_oc=Adm09OHOeRurTPeqmKdWqY9tDzfiO-5nnOxGD4D7--71oIGt6gDc4G2d7rooeVB4SAE&_nc_zt=23&_nc_ht=scontent.fjsr17-1.fna&_nc_gid=HEVd2pje2zOiJpA647amUg&oh=00_AfhhxaVzR3W7vn-AjLN_TvPp335VuvaSS2BDxMGgeaqFHg&oe=69312649",
    category: "Agriculture",
    likes: "220K+",
  },
  {
    id: 2,
    pageName: "Hope71",
    pageLogo: "https://scontent.fjsr8-1.fna.fbcdn.net/v/t39.30808-6/474951435_604902688965102_818565527186838940_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rly_tF-N-EUQ7kNvwGqYjDD&_nc_oc=AdnbTfOgzeW1dYqEGoTdAWYR44bFYkXKAMtdklNNWwHUJjGsn6dxEWKfCsddAojtJ1k&_nc_zt=23&_nc_ht=scontent.fjsr8-1.fna&_nc_gid=voA81EdEyijWR79NT26_pA&oh=00_Afhz0d6tdhnBG9sW2T3IzfskZVbEgWzd5deqfeNUdngjjQ&oe=693135CE",
    category: "Clothing (brand)",
    likes: "208K+",
  },
  {
    id: 3,
    pageName: "KORAS",
    pageLogo: "https://scontent.fjsr17-1.fna.fbcdn.net/v/t39.30808-6/465472162_1102711171857110_3127363895963666204_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=c1FwtZ-cTzMQ7kNvwFvEssC&_nc_oc=AdkjmF_Gw4BmCOvhPtoRJ6kZaIqaBEMaKEZThEBTI6L-O8ABr02Daab8565u0oVqcDc&_nc_zt=23&_nc_ht=scontent.fjsr17-1.fna&_nc_gid=eo62JXdzqhXPd4dzwBuKzQ&oh=00_AfhIRbIApynRWfoRbYKoVwYYuurA-td0VcGwg9tP0sN8aw&oe=693134C6",
    category: "Clothing (brand)",
    likes: "69K+",
  },
  {
    id: 4,
    pageName: "Musami Leather",
    pageLogo: "https://scontent.fjsr8-1.fna.fbcdn.net/v/t39.30808-6/481286041_122140982462529641_3447840312733276465_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=apIN-gevkJcQ7kNvwFNfwZm&_nc_oc=Adk0TRwunyyl0y8OQjdeT463rpA5EaVRdufNxoZtY7yD2RpIkb1RK-4bsQKNj5wg1Mo&_nc_zt=23&_nc_ht=scontent.fjsr8-1.fna&_nc_gid=f68OB6u9mmYJrTQ1seWVnQ&oh=00_Afg-AqL6abV0-OioUoaSD6iEOm3umi0Ia10JLKvn-mLr9g&oe=69313C9D",
    category: "Leather Products",
    likes: "69K+",
  },
  {
    id: 5,
    pageName: "Kabbik",
    pageLogo: "https://scontent.fjsr8-1.fna.fbcdn.net/v/t39.30808-6/272095328_102316415694734_4465619999442417131_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=T8dAUdx8ITQQ7kNvwEM03hF&_nc_oc=AdmnE1q9bf0mjR-dIWv8e1LQl1fpVcOY6P4d_aE9x4HUqvC3_KSuslH7wDmgzaOVCk4&_nc_zt=23&_nc_ht=scontent.fjsr8-1.fna&_nc_gid=tSGr-ge8G1SfN7S3rE4Msg&oh=00_Afj--a5sMooyDklgsY0UKvbD751xLvEY8K9zA6khEL9P7Q&oe=69311B50",
    category: "Arts & Entertainment",
    likes: "125K+",
    quote: "প্রফিট ফার্স্ট মেথড আর এই কমিউনিটির গাইডলাইন—দুটো মিলেই আমার সাকসেস।"
  }
];

const PrivateCommunity = () => {
  return (
    <section className="py-12 md:py-24 bg-linear-to-b from-slate-50 to-white overflow-hidden relative mt-12">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-orange-50 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* HEADLINE SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5">
            <Users size={16} className="text-blue-600" />
            <span className="text-blue-700 font-bold text-xs md:text-sm uppercase tracking-wider">
              Trusted by Top F-Commerce Owners
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            বাংলাদেশের লিডিং <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600"> এফ-কমার্স ব্র্যান্ডগুলো </span>
            এখন 'প্রফিট ফার্স্ট' কমিউনিটিতে
          </h2>
          
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            বইটি অর্ডার করলেই আপনি পাবেন একটি <span className="text-slate-900 font-semibold underline decoration-orange-400 underline-offset-2">সিক্রেট ইনভাইটেশন</span>, যা আপনাকে এই সফল উদ্যোক্তাদের নেটওয়ার্কে যুক্ত হওয়ার সুযোগ করে দেবে।
          </p>
        </div>

        {/* CARDS SECTION (Flex Wrap for perfect centering of 5 items) */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-6">
          {entrepreneurs.map((item) => (
            <div 
              key={item.id} 
              className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
            >
              {/* Card Header: Identity */}
              <div className="p-5 flex items-start gap-4 border-b border-slate-50">
                <div className="relative shrink-0">
                  <img 
                    src={item.pageLogo} 
                    alt={item.pageName} 
                    className="w-24 h-24 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-[#0866ff] shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 -right-1 bg-blue-600 text-white  rounded-full border-2 border-white">
                    {/* <Facebook size={10} fill="currentColor" /> */}
                    <BadgeCheck size={20} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-base md:text-lg truncate leading-tight">
                    {item.pageName}
                  </h4>
                  <p className="text-slate-500 text-xs uppercase tracking-wide font-medium mt-0.5 mb-2">
                    {item.category}
                  </p>
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-lg font-bold">
                    <ThumbsUp size={20} />
                    <span>{item.likes} Followers</span>
                  </div>
                </div>
              </div>

           
            </div>
          ))}
        </div>

        {/* CTA SECTION */}
        <div className="mt-5 text-center">
          <p className="text-lg md:text-xl font-semibold text-slate-800 mb-6">
            আপনার পেজকেও কি <span className="text-blue-600">নেক্সট বিগ ব্র্যান্ড</span> হিসেবে গড়তে চান?
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <a 
              href="#order" 
              className="group relative inline-flex items-center justify-center gap-3 bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
            >
              <span>এখনই অর্ডার করে জয়েন করুন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 -left-full w-[50%] h-full bg-white/20 skew-x-25 group-hover:animate-[shimmer_1s_infinite]"></div>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* Tailwind Animation for Button Shine (Add to global css if not present, but safe to include inline styles usually) */}
      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </section>
  );
};

// Helper icon for the money back guarantee
const ShieldCheck = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
)

export default PrivateCommunity;