import { useEffect, useMemo, useState } from "react";
import CartPreviewDialog from "./components/CartPreviewDialog.jsx";
import CheckoutDialog from "./components/CheckoutDialog.jsx";
import Footer from "./components/Footer.jsx";
import HeroSection from "./components/HeroSection.jsx";
import Navbar from "./components/Navbar.jsx";
import ProductCollection from "./components/ProductCollection.jsx";
import ProductDetailsDialog from "./components/ProductDetailsDialog.jsx";
import ProductShowcase from "./components/ProductShowcase.jsx";
import { useCart } from "./hooks/useCart.js";
import { useAccount } from "./hooks/useAccount.js";
import AccountDialog from "./components/AccountDialog.jsx";
import { products } from "./data/products.js";
import { getProductReviews } from "./utils/reviews.js";

function App() {
  const cart = useCart();
  const account = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [toast, setToast] = useState("");
  const reviewSummaries = useMemo(
    () =>
      Object.fromEntries(
        products.map((product) => [product.id, getProductReviews(product.id)]),
      ),
    [],
  );
  const cartItems = useMemo(
    () =>
      cart.items.flatMap((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return product ? [{ ...item, product }] : [];
      }),
    [cart.items],
  );
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.colorway}`.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function addToCart(product, size, quantity) {
    const added = cart.addItem(product, size, quantity);
    setToast(
      added
        ? `${product.name}, UK size ${size}, added to your demo cart.`
        : "Choose an available shoe size before adding to cart.",
    );
    return added;
  }

  function buyNow(product, size, quantity) {
    const item = { productId: product.id, size: Number(size), quantity };
    if (!addToCart(product, size, quantity)) return;
    setSelectedProduct(null);
    setCartOpen(false);
    setCheckoutItems([
      {
        ...item,
        product,
      },
    ]);
  }

  function beginCartCheckout(items) {
    setCheckoutItems(items);
    setCartOpen(false);
  }

  function completeCheckout(items) {
    items.forEach((item) => cart.removeItem(item.product.id, item.size));
    setToast("Order status updated by the checkout flow.");
  }

  return (
    <div className="site-shell">
      <Navbar
        cartOpen={cartOpen}
        cartCount={cart.itemCount}
        menuOpen={menuOpen}
        onCartOpen={() => setCartOpen(true)}
        onAccountOpen={() => setAccountOpen(true)}
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
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          onProductSelect={setSelectedProduct}
          products={filteredProducts}
          reviewSummaries={reviewSummaries}
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
          onAddToCart={addToCart}
          onBuyNow={buyNow}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          reviewSummary={reviewSummaries[selectedProduct.id]}
        />
      )}

      {cartOpen && (
        <CartPreviewDialog
          error={cart.error}
          itemCount={cart.itemCount}
          items={cartItems}
          onBeginCheckout={beginCartCheckout}
          onClose={() => setCartOpen(false)}
          onRemoveItem={cart.removeItem}
          onUpdateQuantity={cart.updateQuantity}
          subtotal={cart.subtotal}
        />
      )}
      {checkoutItems && (
        <CheckoutDialog
          account={account}
          items={checkoutItems}
          onAccountOpen={() => setAccountOpen(true)}
          onClose={() => setCheckoutItems(null)}
          onOrderPlaced={completeCheckout}
        />
      )}
      {accountOpen && (
        <AccountDialog account={account} onClose={() => setAccountOpen(false)} />
      )}
      {toast && (
        <div className="store-toast" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
