import { useEffect, useRef } from "react";

function ProductDetailsDialog({ onClose, product }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      aria-labelledby="product-dialog-title"
      className="site-dialog product-dialog"
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
        aria-label="Close product preview"
        className="dialog-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <div className="product-dialog__visual">
        <img
          alt={`${product.name} sneaker in ${product.colorway}`}
          src={product.image}
        />
      </div>
      <div className="product-dialog__content">
        <p className="eyebrow">LEGENDS / {product.number}</p>
        <h2 id="product-dialog-title">{product.name}</h2>
        <p className="product-dialog__colorway">{product.colorway}</p>
        <p>{product.description}</p>
        <p className="product-dialog__availability">
          Pricing and product specifications coming soon.
        </p>
      </div>
    </dialog>
  );
}

export default ProductDetailsDialog;
