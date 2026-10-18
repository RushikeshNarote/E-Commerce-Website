import { useMemo, useState } from "react";
import CartPreviewDialog from "./components/CartPreviewDialog.jsx";
import Footer from "./components/Footer.jsx";
import HeroSection from "./components/HeroSection.jsx";
import Navbar from "./components/Navbar.jsx";
import ProductCollection from "./components/ProductCollection.jsx";
import ProductDetailsDialog from "./components/ProductDetailsDialog.jsx";
import ProductShowcase from "./components/ProductShowcase.jsx";
import { products } from "./data/products.js";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.colorway}`.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="site-shell">
      <Navbar
        cartOpen={cartOpen}
        menuOpen={menuOpen}
        onCartOpen={() => setCartOpen(true)}
        onMenuClose={() => {
          setMenuOpen(false);
          setSearchOpen(false);
        }}
        onMenuToggle={() => {
          setSearchOpen(false);
          setMenuOpen((open) => !open);
        }}
        onSearchChange={setSearchQuery}
        onSearchToggle={() => {
          setMenuOpen(false);
          setSearchOpen((open) => !open);
        }}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
      />
      <main>
        <HeroSection />
        <ProductShowcase products={products} />
        <ProductCollection
          onProductSelect={setSelectedProduct}
          products={filteredProducts}
          searchQuery={searchQuery}
        />
        <section className="brand-story" id="story" aria-labelledby="story-title">
          <div className="brand-story__mark" aria-hidden="true">
            L<span>.</span>
          </div>
          <div className="brand-story__content">
            <p className="eyebrow">The LEGENDS mindset</p>
            <h2 id="story-title">
              MADE FOR THE
              <br />
              <span>MOVE BEYOND.</span>
            </h2>
            <p>
              Progress has no finish line. LEGENDS is built around the people
              who keep moving, keep exploring, and set their own pace.
            </p>
          </div>
          <span className="brand-story__coordinates">EST. FORWARD / ALWAYS</span>
        </section>
      </main>
      <Footer />

      {selectedProduct && (
        <ProductDetailsDialog
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}

      {cartOpen && <CartPreviewDialog onClose={() => setCartOpen(false)} />}
    </div>
  );
}

export default App;
