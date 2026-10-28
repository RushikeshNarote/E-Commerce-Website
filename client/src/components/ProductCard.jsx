import { useState } from "react";
import StarRating from "./StarRating.jsx";

function ProductCard({ onAddToCart, onBuyNow, onDetails, product, reviewSummary }) {
  const [selectedSize, setSelectedSize] = useState(
    product.availableSizes.find((size) => !product.unavailableSizes.includes(size)),
  );
  const [imageFailed, setImageFailed] = useState(false);

  function addToCart() {
    onAddToCart(product, selectedSize, 1);
  }

  function buyNow() {
    onBuyNow(product, selectedSize, 1);
  }

  return (
    <article className="product-card">
      <div className="product-card__visual">
        {!imageFailed ? (
          <img
            alt={`${product.name} sneaker in ${product.colorway}`}
            height="220"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={product.image}
            width="287"
          />
        ) : (
          <div className="product-image-fallback" role="img" aria-label={`${product.name} image unavailable`}>
            {product.name}
            <span>Product image unavailable</span>
          </div>
        )}
        <span className="product-card__number">L / {product.number}</span>
        <span
          aria-label={`Accent color for ${product.name}`}
          className="product-card__swatch"
          style={{ "--swatch-color": product.accent }}
        />
      </div>
      <div className="product-card__body">
        <div className="product-card__topline">
          <h3>{product.name}</h3>
          <span className="product-card__price">
            ₹{product.demoPriceInr.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="demo-price-note">Demo price · replace with verified pricing</p>
        <p className="product-card__colorway">{product.colorway}</p>
        <p className="product-card__description">{product.description}</p>
        <div className="product-rating">
          <StarRating
            label={`Demo rating ${reviewSummary.average.toFixed(1)} out of 5 stars`}
            rating={reviewSummary.average}
            size="small"
          />
          <span>
            {reviewSummary.average.toFixed(1)} · {reviewSummary.total} demo reviews
          </span>
        </div>
        <fieldset className="size-picker size-picker--card">
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
                  title={unavailable ? `UK ${size} unavailable` : `Select UK ${size}`}
                  type="button"
                >
                  {size}
                </button>
              );
            })}
          </div>
          <span className="size-picker__hint">Unavailable sizes are disabled.</span>
        </fieldset>
        <div className="product-card__actions">
          <button className="button button--primary" onClick={addToCart} type="button">
            Add to cart
          </button>
          <button className="button button--outline" onClick={buyNow} type="button">
            Buy now
          </button>
        </div>
        <button className="product-card__link" onClick={onDetails} type="button">
          Details &amp; demo reviews <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
