"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Import local images from public folder
import web1 from "@/public/web1.jpg"
import web2 from "@/public/web2.png"
import web3 from "@/public/web3.png"
import web4 from "@/public/web4.png"
import web5 from "@/public/web5.png"
import web6 from "@/public/web6.png"
import web7 from "@/public/web7.png"
import web8 from "@/public/web8.png"
import web9 from "@/public/web9.png"
import web10 from "@/public/web10.png"
import web11 from "@/public/web11.png"
import web12 from "@/public/web12.png"

// Reviews data using the imported images
const reviewsData = [
  {
    id: 1,
    author: 'মুরাদ বিন জাফর',
    verified: true,
    rating: 5,
    text: 'This book is one of the good books that I have come across for beginners stock market learning. It is very interactive and the use of illustrations and pictures is great.',
    images: [web1, web2, web3],
  },
  {
    id: 2,
    author: 'কাবির জাহান',
    verified: true,
    rating: 4,
    text: 'Good book, but some topics could be explained better. The pictures are helpful.',
    images: [web4, web5],
  },
  {
    id: 3,
    author: 'Anonymous',
    verified: false,
    rating: 5,
    text: 'Absolutely fantastic! Changed my perspective on investing.',
    images: [web6, web7, web8],
  },
  {
    id: 4,
    author: 'S. Ahmed',
    verified: true,
    rating: 5,
    text: 'Highly recommended for all new investors. Clear, concise, and the images really help to understand complex ideas.',
    images: [web9, web10, web11, web12],
  },
];

// Star Rating Component
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'text-xl text-yellow-400' : 'text-xl text-gray-300'}>
        ★
      </span>
    );
  }
  return <div className="flex">{stars}</div>;
};

// Review Card Component
const ReviewCard = ({ review, onImageClick }) => {
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Reviewer Info */}
      <div className="flex items-center mb-2.5">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-lg mr-2.5 uppercase">
          {getInitials(review.author)}
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-gray-800 flex items-center">
            {review.author}
            {review.verified && (
              <span className="text-green-500 ml-1.5 text-sm" title="Verified Customer">
                ✔
              </span>
            )}
          </div>
          {review.verified && (
            <div className="text-xs text-gray-600">ভেরিফাইড কাস্টমার</div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-2.5">
        <StarRating rating={review.rating} />
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {review.text}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1.5">
          {review.images.map((imageSrc, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded overflow-hidden cursor-pointer shrink-0 relative w-[70px] h-[70px]"
              onClick={() => onImageClick(imageSrc, review.images)}
            >
              <Image
                src={imageSrc}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
                sizes="70px"
                placeholder="blur"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Image Modal Component
const ImageModal = ({ images, initialImage, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const initialIndex = images.indexOf(initialImage);
    if (initialIndex !== -1) {
      setCurrentIndex(initialIndex);
    }
  }, [initialImage, images]);

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg p-4 w-full max-w-sm flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full text-3xl text-gray-700 cursor-pointer flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Main Image */}
        <div className="relative w-full h-64 sm:h-80 mb-4">
          <Image
            src={currentImage}
            alt="Full screen review"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 640px"
            placeholder="blur"
            priority
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 cursor-pointer text-2xl z-10 flex items-center justify-center transition-colors"
                onClick={goToPrevious}
              >
                &lt;
              </button>
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 cursor-pointer text-2xl z-10 flex items-center justify-center transition-colors"
                onClick={goToNext}
              >
                &gt;
              </button>
            </>
          )}
        </div>

        {/* Image Counter */}
        <div className="text-sm text-gray-600 mb-2">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnails Carousel */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto w-full justify-center p-2">
            {images.map((imageSrc, index) => (
              <div
                key={index}
                className={`border-2 cursor-pointer rounded overflow-hidden shrink-0 relative w-16 h-16 transition-all ${
                  index === currentIndex ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={(e) => handleThumbnailClick(e, index)}
              >
                <Image
                  src={imageSrc}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  placeholder="blur"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function ReviewCardPage() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    images: [],
    initialImage: null,
  });

  const openModal = (imageSrc, allImages) => {
    setModalState({
      isOpen: true,
      images: allImages,
      initialImage: imageSrc,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      images: [],
      initialImage: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          কাস্টমার রিভিউ
        </h1>
        
        <div className="space-y-4">
          {reviewsData.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onImageClick={openModal}
            />
          ))}
        </div>
      </div>

      {modalState.isOpen && (
        <ImageModal
          images={modalState.images}
          initialImage={modalState.initialImage}
          onClose={closeModal}
        />
      )}
    </div>
  );
}