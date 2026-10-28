import { useEffect, useRef } from "react";

function formatPrice(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function CartPreviewDialog({
  error,
  itemCount,
  items,
  onBeginCheckout,
  onClose,
  onRemoveItem,
  onUpdateQuantity,
  subtotal,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby="cart-title"
      className="site-dialog cart-dialog cart-dialog--shop"
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
        aria-label="Close cart"
        className="dialog-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <div className="cart-dialog__header">
        <p className="eyebrow">LEGENDS / YOUR BAG · {itemCount} ITEMS</p>
        <h2 id="cart-title">Your cart.</h2>
      </div>
      {error && <p className="cart-message cart-message--error" role="alert">{error}</p>}
      {items.length ? (
        <div className="cart-dialog__content">
          <ul className="cart-items">
            {items.map(({ product, quantity, size }) => (
              <li className="cart-item" key={`${product.id}-${size}`}>
                <img
                  alt=""
                  height="110"
                  loading="lazy"
                  src={product.image}
                  width="144"
                />
                <div className="cart-item__details">
                  <h3>{product.name}</h3>
                  <p>{product.colorway}</p>
                  <p>UK size {size}</p>
                  <div className="cart-item__quantity" aria-label={`Quantity for ${product.name}, UK size ${size}`}>
                    <button
                      aria-label={`Decrease ${product.name} quantity`}
                      disabled={quantity <= 1}
                      onClick={() => onUpdateQuantity(product.id, size, quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={quantity >= 10}
                      onClick={() => onUpdateQuantity(product.id, size, quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => onRemoveItem(product.id, size)}
                    type="button"
                  >
                    Remove item
                  </button>
                </div>
                <strong className="cart-item__price">
                  {formatPrice(product.demoPriceInr * quantity)}
                </strong>
              </li>
            ))}
          </ul>
          <aside className="cart-summary" aria-label="Estimated cart totals">
            <p><span>Estimated item subtotal</span><strong>{formatPrice(subtotal)}</strong></p>
            <p><span>Delivery &amp; payment fees</span><strong>Shown at checkout</strong></p>
            <p className="cart-summary__total"><span>Estimated total</span><strong>{formatPrice(subtotal)}</strong></p>
            <p className="cart-summary__note">
              Prices are development placeholders. The backend recalculates the total before an order is placed.
            </p>
            <button
              className="button button--primary"
              onClick={() => onBeginCheckout(items)}
              type="button"
            >
              Continue to checkout
            </button>
            <button className="cart-continue" onClick={onClose} type="button">
              Continue shopping <span aria-hidden="true">↗</span>
            </button>
          </aside>
        </div>
      ) : (
        <div className="cart-empty">
          <p>Your bag is empty.</p>
          <p>Choose an available shoe size to add a pair to your demo cart.</p>
          <button className="button button--primary" onClick={onClose} type="button">
            Continue shopping <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      <p className="cart-demo-note">
        Cart items are saved in this browser. Prices and size availability are development values; the server validates every order.
      </p>
    </dialog>
  );
}

export default CartPreviewDialog;
