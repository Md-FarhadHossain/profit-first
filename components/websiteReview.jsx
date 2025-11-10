import ReviewCardPage from "../app/reviewCard/page"

const WebsiteReview = () => {
  return (
    <div>
      <div className="container mx-auto">
        <h1 className="text-4xl px-4 text-center mt-16 mb-4">আমাদের ওয়েবসাইটে যারা রিভিউ দিয়েছেন</h1>
        <ReviewCardPage />
      </div>
    </div>
  );
};

export default WebsiteReview;
