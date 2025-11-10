import React from "react";

const BookVideo = () => {
  return (
    <section>
      <div className="container mx-auto px-2">
        <div>
          <h1 className="text-4xl mt-10 mb-4 text-center">একনজরে দেখনে নিন</h1>
          <div className="relative w-full pb-[56.25%]">
            {" "}
            {/* 16:9 aspect ratio */}
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/QHajRDjjER4?si=ve5cDldP_bgSxy-u"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookVideo;
