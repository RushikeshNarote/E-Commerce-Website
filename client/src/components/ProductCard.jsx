function ProductCard({ onDetails, product }) {
  return (
    <article className="product-card">
      <div className="product-card__visual">
        <img
          alt={`${product.name} sneaker in ${product.colorway}`}
          height="220"
          loading="lazy"
          src={product.image}
          width="287"
        />
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
          <span className="product-card__price">Price TBA</span>
        </div>
        <p className="product-card__colorway">{product.colorway}</p>
        <p className="product-card__description">{product.description}</p>
        <button
          className="product-card__link"
          onClick={onDetails}
          type="button"
        >
          Product preview <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
