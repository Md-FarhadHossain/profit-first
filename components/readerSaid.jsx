import Image from "next/image";
import re01 from "@/public/re1.png";
import re02 from "@/public/re2.png";
import re03 from "@/public/re3.png";
import re04 from "@/public/re4.png";
import re05 from "@/public/re5.png";
import re06 from "@/public/re6.png";

const ReaderSaid = () => {
  return (
    <section>
      <div>
        <h1 className="text-4xl text-center px-4 mt-16 mb-6">আমাদের বইটি পরে যারা উপকৃত হয়েছেন</h1>
        <div className="flex w-fit">
          <Image className="w-1/3 -rotate-7 shadow-xl" src={re01} alt="ms01" />
          <Image className="w-1/3 shadow-xl" src={re02} alt="ms01" />
          <Image className="w-1/3 rotate-7 shadow-xl" src={re03} alt="ms01" />
        </div>
        <div className="flex w-fit my-8">
          <Image className="w-1/3 -rotate-7 shadow-xl" src={re04} alt="ms01" />
          <Image className="w-1/3 shadow-xl" src={re05} alt="ms01" />
          <Image className="w-1/3 rotate-7 shadow-xl" src={re06} alt="ms01" />
        </div>
      </div>
    </section>
  );
};

export default ReaderSaid;
