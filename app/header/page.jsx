
import BookInfo from "@/components/bookInfo";
import AllReaders from "@/components/allReaders";
import WhatsInside from "@/components/whatsInside";
import Testimonials from "@/components/testimonials";
import BookVideo from "@/components/bookVideo";
import GetsTheBook from "@/components/getsTheBook";
import ReaderSaid from "@/components/readerSaid";
import WebsiteReview from "@/components/websiteReview";

import HeroSction from "../hero/page";

const HeaderSection = () => {
  return (
    <section className="overflow-x-hidden">
      <div className="container mx-auto px-4">
        <BookInfo />
        <AllReaders />
        <WhatsInside />
      </div>

      <div>
        <Testimonials />
      </div>
      <BookVideo />
      <GetsTheBook />

      <ReaderSaid />
      <WebsiteReview />

      
        <HeroSction />
    </section>
  );
};

export default HeaderSection;
