
import readers1 from "@/public/readers-1.png";
import readers2 from "@/public/readers-2.png";
import readers3 from "@/public/readers-3.png";
import readers4 from "@/public/readers-4.png";
import readers5 from "@/public/readers-5.png";
import readers6 from "@/public/readers-6.png";
import readers7 from "@/public/readers-7.png";
import readers8 from "@/public/readers-8.png";
import readers9 from "@/public/readers-9.png";
import Image from "next/image";

const GetsTheBook = () => {
      const readersOne = [
    { id: 1, src: readers1, alt: "Reader 1" },
    { id: 2, src: readers2, alt: "Reader 2" },
    { id: 3, src: readers3, alt: "Reader 3" },
    { id: 4, src: readers4, alt: "Reader 4" },
  ];

  const readersTwo = [
    { id: 5, src: readers5, alt: "Reader 5" },
    { id: 6, src: readers6, alt: "Reader 6" },
    { id: 7, src: readers7, alt: "Reader 7" },
    { id: 8, src: readers8, alt: "Reader 8" },
    { id: 9, src: readers9, alt: "Reader 9" },
  ];
  return (
    <section>
      <div className="mt-16 container mx-auto px-4">
        <div>
          <h1 className="text-4xl text-center mb-3">বইটি যারা হাতে পেয়েছেন:</h1>
          <div className="grid grid-cols-2 gap-1.5">
            {readersOne.map((reader) => (
              <div key={reader.id}>
                <Image src={reader.src} alt="Profit first book review" />
              </div>
            ))}
            {readersTwo.map((reader) => (
              <div key={reader.id}>
                <Image src={reader.src} alt="Profit first book review" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetsTheBook;
