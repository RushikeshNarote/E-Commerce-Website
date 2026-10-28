import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating.jsx";

function ProductDetailsDialog({
  onAddToCart,
  onBuyNow,
  onClose,
  product,
  reviewSummary,
}) {
  const dialogRef = useRef(null);
  const [selectedSize, setSelectedSize] = useState(
    product.availableSizes.find((size) => !product.unavailableSizes.includes(size)),
  );
  const [ratingFilter, setRatingFilter] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const distribution = reviewSummary.counts;

  function addToCart() {
    onAddToCart(product, selectedSize, 1);
  }

  return (
    <dialog
      aria-labelledby="product-dialog-title"
      className="site-dialog product-dialog product-dialog--shop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <button
        aria-label="Close product details"
        className="dialog-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <div className="product-dialog__layout">
        <div className="product-dialog__visual">
          {!imageFailed ? (
            <img
              alt={`${product.name} sneaker in ${product.colorway}`}
              onError={() => setImageFailed(true)}
              src={product.image}
            />
          ) : (
            <div className="product-image-fallback" role="img" aria-label={`${product.name} image unavailable`}>
              {product.name}
              <span>Product image unavailable</span>
            </div>
          )}
        </div>
        <div className="product-dialog__content">
          <p className="eyebrow">LEGENDS / {product.number}</p>
          <h2 id="product-dialog-title">{product.name}</h2>
          <p className="product-dialog__colorway">{product.colorway}</p>
          <p>{product.description}</p>
          <p className="product-dialog__price">
            ₹{product.demoPriceInr.toLocaleString("en-IN")}
            <span>Demo price · not a verified business price</span>
          </p>
          <div className="product-rating product-rating--details">
            <StarRating
              label={`Demo rating ${reviewSummary.average.toFixed(1)} out of 5 stars`}
              rating={reviewSummary.average}
            />
            <span>
              {reviewSummary.average.toFixed(1)} / 5 · {reviewSummary.total} demo
              reviews
            </span>
          </div>
          <fieldset className="size-picker">
            <legend>Select shoe size (UK)</legend>
            <div className="size-picker__options">
              {product.availableSizes.map((size) => {
                const unavailable = product.unavailableSizes.includes(size);
                return (
                  <button
                    aria-label={`UK size ${size}${unavailable ? ", unavailable" : ""}`}
                    aria-pressed={selectedSize === size}
                    className={`size-option${selectedSize === size ? " size-option--selected" : ""}`}
                    disabled={unavailable}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <span className="size-picker__hint">
              Sizes are a storefront demo; inventory is not connected.
            </span>
          </fieldset>
          <div className="product-card__actions product-dialog__actions">
            <button className="button button--primary" onClick={addToCart} type="button">
              Add to cart
            </button>
            <button
              className="button button--outline"
              onClick={() => onBuyNow(product, selectedSize, 1)}
              type="button"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      <section className="product-reviews" aria-labelledby="reviews-title">
        <div className="product-reviews__heading">
          <div>
            <p className="eyebrow">Development sample data</p>
            <h3 id="reviews-title">Reviews &amp; ratings</h3>
          </div>
          <span className="demo-badge">DEMO REVIEWS · NOT TESTIMONIALS</span>
        </div>
        <div className="review-summary">
          <div className="review-summary__score">
            <strong>{reviewSummary.average.toFixed(1)}</strong>
            <StarRating rating={reviewSummary.average} />
            <span>{reviewSummary.total} sample reviews</span>
          </div>
          <div className="review-summary__distribution" aria-label="Rating distribution filters">
            {distribution.map(({ rating, count }) => {
              const percentage = reviewSummary.total
                ? (count / reviewSummary.total) * 100
                : 0;
              return (
                <button
                  aria-pressed={ratingFilter === rating}
                  className={`rating-filter${ratingFilter === rating ? " rating-filter--active" : ""}`}
                  key={rating}
                  onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                  type="button"
                >
                  <span>{rating} star{rating === 1 ? "" : "s"}</span>
                  <span className="rating-filter__track" aria-hidden="true">
                    <span style={{ width: `${percentage}%` }} />
                  </span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="review-demo-warning">
          These seeded examples are fictional interface data. None are verified
          purchases or actual customer statements.
        </p>
        <div className="review-list">
          {reviewSummary.reviews.length ? (
            reviewSummary.reviews.map((review) => (
              <article className="review-item" key={review.id}>
                <div className="review-item__top">
                  <div>
                    <h4>{review.title}</h4>
                    <p>{review.reviewer}</p>
                  </div>
                  <time dateTime={review.date}>
                    {new Date(`${review.date}T12:00:00`).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <StarRating
                  label={`${review.rating} out of 5 stars`}
                  rating={review.rating}
                  size="small"
                />
                <p className="review-item__text">{review.text}</p>
                {review.verifiedPurchase && !review.isDemo && (
                  <span className="verified-purchase">Verified purchase</span>
                )}
                {review.isDemo && <span className="review-item__demo">Demo data</span>}
              </article>
            ))
          ) : (
            <p className="collection-empty" role="status">
              No sample reviews have this rating.
            </p>
          )}
        </div>
        <form className="review-form" onSubmit={(event) => event.preventDefault()}>
          <h4>Write a review</h4>
          <p>
            Reviews are available only after sign-in and server verification of a
            successful payment and delivered order item.
          </p>
          <p className="review-form__disabled-note" role="status">
            Review submission is unavailable: authentication, verified orders,
            payment confirmation, and delivery tracking are not connected in this
            demo.
          </p>
          <fieldset disabled>
            <label>
              Rating
              <select defaultValue="5">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} star{rating === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Review title
              <input placeholder="A short summary" />
            </label>
            <label>
              Your review
              <textarea placeholder="Share your experience" rows="3" />
            </label>
            <button className="button button--primary" type="submit">
              Submit review
            </button>
          </fieldset>
        </form>
      </section>
    </dialog>
  );
}

export default ProductDetailsDialog;
