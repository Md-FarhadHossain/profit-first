
import BookInfo from "@/components/bookInfo";
import AllReaders from "@/components/allReaders";
import WhatsInside from "@/components/whatsInside";
import Testimonials from "@/components/testimonials";
import BookVideo from "@/components/bookVideo";
import GetsTheBook from "@/components/getsTheBook";
import ReaderSaid from "@/components/readerSaid";
import WebsiteReview from "@/components/websiteReview";
import OrderNowBtn from "@/components/orderNowBtn";
import AniOrderNowBtn from "@/components/aniBtn";
import TopHeader from "@/components/topHeader";
import FreeGift from "@/components/freeGift"
import BottomInfo from "@/components/bottomInfo"
import BookInside from "@/components/bookInside"

import HeroSction from "../hero/page";
import PageSwiper from "@/components/PageSwiper";

import Navbar from "@/components/Navbar"


const HeaderSection = () => {
  return (
    <section className="overflow-x-hidden">
      <div className="container mx-auto px-4">
   {/* <Navbar /> */}

   <BottomInfo />
      
        {/* <TopHeader /> */}
        {/* <AniOrderNowBtn />   */}
        <BookInfo />
        <AllReaders />
        <BookInside />
        {/* <WhatsInside /> */}

      </div>

      <div>
        <Testimonials />
      </div>
      <BookVideo />
      <GetsTheBook />

      <ReaderSaid />
      <WebsiteReview />
        <PageSwiper />
        {/* <FreeGift /> */}


      
        <HeroSction />

    </section>
  );
};

export default HeaderSection;
