function StarRating({ rating, label, size = "regular" }) {
  return (
    <span
      aria-label={label || `${rating.toFixed(1)} out of 5 stars`}
      className={`star-rating star-rating--${size}`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, rating - star + 1)) * 100;
        return (
          <span className="star-rating__star" key={star} aria-hidden="true">
            <span className="star-rating__empty">★</span>
            <span className="star-rating__filled" style={{ width: `${fill}%` }}>
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default StarRating;
