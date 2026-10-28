import { demoReviews } from "../data/demoReviews.js";

export function getProductReviews(productId, ratingFilter = 0) {
  const reviews = demoReviews.filter((review) => review.productId === productId);
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return {
    average,
    counts,
    total: reviews.length,
    reviews: ratingFilter
      ? reviews.filter((review) => review.rating === ratingFilter)
      : reviews,
  };
}
