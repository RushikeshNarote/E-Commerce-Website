import { useEffect, useRef } from "react";

function CartPreviewDialog({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      className="site-dialog cart-dialog"
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
        aria-label="Close cart preview"
        className="dialog-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <p className="eyebrow">Your bag · 00 items</p>
      <h2>Your next move starts here.</h2>
      <p>
        Your bag is empty. Cart and checkout are not connected to store data yet.
      </p>
      <button
        className="button button--primary"
        onClick={onClose}
        type="button"
      >
        Continue exploring <span aria-hidden="true">↗</span>
      </button>
    </dialog>
  );
}

export default CartPreviewDialog;
