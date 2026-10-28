import ProductCard from "./ProductCard.jsx";

function ProductCollection({
  onAddToCart,
  onBuyNow,
  onProductSelect,
  products,
  reviewSummaries,
  searchQuery,
}) {
  return (
    <section className="collection section-wrap" id="collection" aria-labelledby="collection-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Five forms. One direction.</p>
          <h2 id="collection-title">
            THE <span>COLLECTION</span>
          </h2>
        </div>
        <p className="section-heading__copy">
          Find your colorway. The details are in the build.
        </p>
      </div>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onDetails={() => onProductSelect(product)}
              product={product}
              reviewSummary={reviewSummaries[product.id]}
            />
          ))}
        </div>
      ) : (
        <p className="collection-empty" role="status">
          No colorways match “{searchQuery}”. Try a product name or color.
        </p>
      )}
      <p className="collection-demo-note">
        Prices and customer reviews shown here are clearly labelled demo data;
        they are not verified business prices or customer testimonials.
      </p>
    </section>
  );
}

export default ProductCollection;
