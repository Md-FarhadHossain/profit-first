import Image from "next/image";

import ms01 from "@/public/ms01.jpg";
import ms02 from "@/public/ms01.jpg";
import ms03 from "@/public/ms01.jpg";
import ms04 from "@/public/wa01.jpg";
import ms05 from "@/public/wa01.jpg";
import ms06 from "@/public/wa01.jpg";


const Testimonials = () => {
  return (
    <section className="mb-4 mt-16 text-center">
    <h1 className="text-4xl">বইটি পড়ার পর যা বলেছেন</h1>
      <div className="flex w-fit mt-5">
        <Image className="w-1/3 -rotate-7 shadow-xl" src={ms01} alt="ms01" />
        <Image className="w-1/3 shadow-xl" src={ms04} alt="ms01" />
        <Image className="w-1/3 rotate-7 shadow-xl" src={ms02} alt="ms01" />
      </div>
      <div className="flex w-fit my-8">
        <Image className="w-1/3 -rotate-7 shadow-xl" src={ms05} alt="ms01" />
        <Image className="w-1/3 shadow-xl" src={ms03} alt="ms01" />
        <Image className="w-1/3 rotate-7 shadow-xl" src={ms06} alt="ms01" />
      </div>
    </section>
  );
};

export default Testimonials;
