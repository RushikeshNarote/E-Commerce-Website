import ProductCard from "./ProductCard.jsx";

function ProductCollection({ products, onProductSelect, searchQuery }) {
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
              onDetails={() => onProductSelect(product)}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className="collection-empty" role="status">
          No colorways match “{searchQuery}”. Try a product name or color.
        </p>
      )}
    </section>
  );
}

export default ProductCollection;
