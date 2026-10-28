import { useEffect, useMemo, useRef, useState } from "react";
import { AddressFields } from "./AccountDialog.jsx";

const emptyAddress = (user) => ({
  label: "Home",
  recipientName: user?.fullName || "",
  phone: user?.phone || "",
  houseFlat: "",
  street: "",
  locality: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  latitude: null,
  longitude: null,
});

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function createIdempotencyKey(items) {
  const fingerprint = items
    .map((item) => `${item.product.id}:${item.size}:${item.quantity}`)
    .sort()
    .join("|");
  const storageKey = `legends-checkout-idempotency-v1:${encodeURIComponent(fingerprint)}`;
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) return { key: stored, storageKey };
    const created = globalThis.crypto?.randomUUID?.() || `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(storageKey, created);
    return { key: created, storageKey };
  } catch {
    return {
      key: globalThis.crypto?.randomUUID?.() || `order-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      storageKey,
    };
  }
}

async function loadRazorpay() {
  if (window.Razorpay) return true;
  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    await new Promise((resolve, reject) => {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
    });
    return Boolean(window.Razorpay);
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return Boolean(window.Razorpay);
}

function CheckoutDialog({ account, items, onAccountOpen, onClose, onOrderPlaced }) {
  const dialogRef = useRef(null);
  const idempotencyKey = useRef(null);
  if (!idempotencyKey.current) idempotencyKey.current = createIdempotencyKey(items);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressDraft, setAddressDraft] = useState(() => emptyAddress(account.user));
  const [usingNewAddress, setUsingNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [pendingOnlineOrderId, setPendingOnlineOrderId] = useState("");
  const [priceQuote, setPriceQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteRefreshKey, setQuoteRefreshKey] = useState(0);

  const quoteItems = useMemo(
    () => items.map(({ product, quantity: itemQuantity, size }) => ({
      productId: product.id,
      size: Number(size),
      quantity: itemQuantity,
    })),
    [items],
  );
  const quoteItemsSignature = JSON.stringify(quoteItems);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedAddress = account.addresses.find((address) => address._id === selectedAddressId);
  const activeQuote =
    priceQuote?.itemsSignature === quoteItemsSignature &&
    priceQuote.paymentMethod === paymentMethod
      ? priceQuote
      : null;
  const displayedPricing = createdOrder || activeQuote;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (selectedAddressId || !account.addresses.length) return;
    const initialAddress = account.addresses.find((address) => address.isDefault) || account.addresses[0];
    setSelectedAddressId(initialAddress._id);
  }, [account.addresses, selectedAddressId]);

  useEffect(() => {
    if (!account.isAuthenticated || !account.user?.phoneVerified || !account.user?.emailVerified || createdOrder) {
      setPriceQuote(null);
      setQuoteLoading(false);
      return undefined;
    }
    let active = true;
    setPriceQuote(null);
    setQuoteLoading(true);
    setQuoteError("");
    account.request("/orders/quote", {
      method: "POST",
      body: JSON.stringify({ items: quoteItems, paymentMethod }),
    }).then((result) => {
      if (active) setPriceQuote({ ...result, itemsSignature: quoteItemsSignature });
    }).catch((quoteRequestError) => {
      if (active) setQuoteError(quoteRequestError.message);
    }).finally(() => {
      if (active) setQuoteLoading(false);
    });
    return () => { active = false; };
  }, [
    account.isAuthenticated,
    account.request,
    account.user?.emailVerified,
    account.user?.phoneVerified,
    createdOrder,
    paymentMethod,
    quoteItems,
    quoteItemsSignature,
    quoteRefreshKey,
  ]);

  useEffect(() => {
    setAddressDraft((current) => ({
      ...current,
      recipientName: current.recipientName || account.user?.fullName || "",
      phone: current.phone || account.user?.phone || "",
    }));
  }, [account.user]);

  async function populateLocation() {
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable in this browser. You can enter the address manually.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await account.request("/account/addresses/reverse-geocode", {
          method: "POST",
          body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
        });
        setAddressDraft((current) => ({ ...current, ...result.address }));
      } catch (requestError) {
        setLocationError(`${requestError.message} Enter the address manually if needed.`);
      } finally {
        setLocating(false);
      }
    }, (geoError) => {
      setLocationError(geoError.code === 1
        ? "Location permission was denied. You can enter the address manually."
        : geoError.code === 3
          ? "Location lookup timed out. Try again or enter the address manually."
          : "Current location is unavailable. You can enter the address manually.");
      setLocating(false);
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 });
  }

  async function createOrder(addressId) {
    const orderItems = items.map(({ product, quantity: itemQuantity, size }) => ({
      productId: product.id,
      size: Number(size),
      quantity: itemQuantity,
    }));
    return account.request("/orders", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey.current.key },
      body: JSON.stringify({
        items: orderItems,
        paymentMethod,
        quoteToken: activeQuote?.quoteToken,
        ...(addressId ? { addressId } : { shippingAddress: addressDraft }),
      }),
    });
  }

  async function prepareAddress() {
    if (selectedAddress && !usingNewAddress) return selectedAddress._id;
    if (saveAddress) {
      const { address } = await account.updateAddresses("/account/addresses", "POST", {
        ...addressDraft,
        isDefault: account.addresses.length === 0,
      });
      setSelectedAddressId(address._id);
      setUsingNewAddress(false);
      return address._id;
    }
    return "";
  }

  async function startOnlinePayment(orderId) {
    const paymentSession = await account.request(`/orders/${orderId}/payment`, { method: "POST" });
    const loaded = await loadRazorpay().catch(() => false);
    if (!loaded || !window.Razorpay) {
      throw new Error("Razorpay Checkout could not be loaded. Your order is still pending; you can safely retry.");
    }
    const checkout = new window.Razorpay({
      key: paymentSession.keyId,
      amount: paymentSession.amount,
      currency: paymentSession.currency,
      name: "LEGENDS — MOVE BEYOND",
      description: `Order ${orderId.slice(-8).toUpperCase()}`,
      order_id: paymentSession.providerOrderId,
      prefill: {
        name: account.user.fullName,
        email: account.user.email,
        contact: account.user.phone,
      },
      theme: { color: "#FF6700" },
      handler: async (result) => {
        setBusy(true);
        setError("");
        try {
          const verified = await account.request(`/orders/${orderId}/verify-payment`, {
            method: "POST",
            body: JSON.stringify(result),
          });
          setCreatedOrder(verified.order);
          setMessage("Payment was confirmed by the payment provider.");
          onOrderPlaced(items);
          sessionStorage.removeItem(idempotencyKey.current.storageKey);
          await account.refresh();
        } catch (verificationError) {
          setError(`${verificationError.message} The order remains unpaid until trusted confirmation.`);
        } finally {
          setBusy(false);
        }
      },
      modal: {
        ondismiss: () => setMessage("Payment window closed. The order remains pending; no payment is shown as successful."),
      },
    });
    checkout.on("payment.failed", (failure) => {
      setError(failure.error?.description || "Payment did not complete. The order remains pending and can be retried.");
    });
    checkout.open();
  }

  async function submit(event) {
    event.preventDefault();
    if (!account.isAuthenticated) {
      setError("Sign in to your account before placing an order.");
      return;
    }
    if (!account.user.phoneVerified || !account.user.emailVerified) {
      setError("Verify both your account phone number and email address before placing an order.");
      return;
    }
    if (!activeQuote && !createdOrder) {
      setError(quoteError || "Confirming current catalog prices. Please wait before placing your order.");
      return;
    }
    if (!items.length) {
      setError("Your cart is empty. Return to the collection to choose a pair.");
      return;
    }
    if (!selectedAddress && !usingNewAddress) {
      setError("Select a saved address or choose Add New Address.");
      return;
    }
    if (usingNewAddress && !event.currentTarget.reportValidity()) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const addressId = await prepareAddress();
      const result = pendingOnlineOrderId && paymentMethod === "ONLINE"
        ? { order: createdOrder || { id: pendingOnlineOrderId } }
        : await createOrder(addressId);
      const order = result.order;
      if (paymentMethod === "COD") {
        setCreatedOrder(order);
        setMessage(`COD order ${order.id.slice(-8).toUpperCase()} placed. Pay ${formatPrice(order.totalInr)} when it arrives. Payment is still pending.`);
        onOrderPlaced(items);
        sessionStorage.removeItem(idempotencyKey.current.storageKey);
        await account.refresh();
        return;
      }
      setPendingOnlineOrderId(order.id);
      if (!createdOrder) setCreatedOrder(order);
      await startOnlinePayment(order.id);
    } catch (submitError) {
      setError(submitError.message);
      if (submitError.status === 409 && submitError.message.toLowerCase().includes("quote")) {
        setPriceQuote(null);
        setQuoteError("");
        setQuoteRefreshKey((current) => current + 1);
        setMessage("The catalog price changed. Review the refreshed server total before confirming again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const addressSummary = selectedAddress && !usingNewAddress
    ? `${selectedAddress.recipientName}, ${[selectedAddress.houseFlat, selectedAddress.street, selectedAddress.locality, selectedAddress.city, selectedAddress.state, selectedAddress.postalCode].filter(Boolean).join(", ")} · ${selectedAddress.phone}`
    : usingNewAddress
      ? `${addressDraft.recipientName || "New recipient"} · ${[addressDraft.houseFlat, addressDraft.street, addressDraft.locality, addressDraft.city, addressDraft.state, addressDraft.postalCode].filter(Boolean).join(", ")}`
      : "No address selected";

  return (
    <dialog
      aria-labelledby="checkout-title"
      className="site-dialog checkout-dialog checkout-dialog--integrated"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }}
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <button aria-label="Close checkout" className="dialog-close" onClick={onClose} type="button">×</button>
      <div className="checkout-dialog__header">
        <p className="eyebrow">LEGENDS / SECURE CHECKOUT</p>
        <h2 id="checkout-title">Almost there.</h2>
        <p>Confirm your delivery address and preferred way to pay.</p>
      </div>

      {!account.user ? (
        <section className="checkout-auth-required">
          <h3>Sign in to continue</h3>
          <p>Order placement requires a verified customer account and saved or confirmed delivery address.</p>
          <button className="button button--primary" onClick={onAccountOpen} type="button">Open account</button>
        </section>
      ) : (
        <form className="checkout-grid" onSubmit={submit}>
          <div className="checkout-form">
            <fieldset className="checkout-address-step" disabled={Boolean(createdOrder)}>
              <h3>Delivery address</h3>
              <p className="checkout-address-step__verified">
                Account contacts · {account.user.email} ({account.user.emailVerified ? "verified" : "not verified"}) · {account.user.phone} ({account.user.phoneVerified ? "verified" : "not verified"})
              </p>
              {account.addresses.map((address) => (
                <label className={`checkout-address-option${selectedAddressId === address._id && !usingNewAddress ? " checkout-address-option--selected" : ""}`} key={address._id}>
                  <input checked={selectedAddressId === address._id && !usingNewAddress} name="delivery-address" onChange={() => { setSelectedAddressId(address._id); setUsingNewAddress(false); }} type="radio" />
                  <span><strong>{address.recipientName} · {address.label}</strong>{address.isDefault && <em>Default</em>}<small>{[address.houseFlat, address.street, address.locality, address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</small><small>{address.phone}</small></span>
                </label>
              ))}
              <label className={`checkout-address-option${usingNewAddress ? " checkout-address-option--selected" : ""}`}>
                <input checked={usingNewAddress} name="delivery-address" onChange={() => setUsingNewAddress(true)} type="radio" />
                <span><strong>Add New Address</strong><small>Enter and confirm an address for this order.</small></span>
              </label>
              {usingNewAddress && !createdOrder && <>
                <AddressFields value={addressDraft} onChange={setAddressDraft} onLocate={populateLocation} locating={locating} locationError={locationError} />
                <label className="account-checkbox"><input checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} type="checkbox" /> Save this address to my account</label>
              </>}
            </fieldset>
            <fieldset className="payment-methods" disabled={Boolean(createdOrder)}>
              <legend>Choose payment method</legend>
              <label className={`payment-method${paymentMethod === "COD" ? " payment-method--selected" : ""}`}>
                <input checked={paymentMethod === "COD"} name="payment-method" onChange={() => setPaymentMethod("COD")} type="radio" />
                <span><strong>Cash on Delivery</strong><small>Pay when your order arrives. Additional fee: ₹40.</small></span>
              </label>
              <label className={`payment-method${paymentMethod === "ONLINE" ? " payment-method--selected" : ""}`}>
                <input checked={paymentMethod === "ONLINE"} name="payment-method" onChange={() => setPaymentMethod("ONLINE")} type="radio" />
                <span><strong>Online Payment</strong><small>Pay securely through Razorpay. Save ₹30 on orders above ₹100.</small></span>
              </label>
            </fieldset>
            {quoteLoading && !createdOrder && <p className="checkout-payment-note" role="status">Confirming current prices and availability with LEGENDS…</p>}
            {quoteError && !createdOrder && <p className="checkout-message checkout-message--error" role="alert">{quoteError}</p>}
            {error && <p className="checkout-message checkout-message--error" role="alert">{error}</p>}
            {message && <p className="checkout-message checkout-message--info" role="status">{message}</p>}
            {!createdOrder && (
              <button className="button button--primary checkout-place-order" disabled={busy || quoteLoading || !activeQuote || !account.user.phoneVerified || !account.user.emailVerified} type="submit">
                {busy ? "Preparing secure order…" : paymentMethod === "COD" ? "Place COD order" : "Continue to secure payment"}
              </button>
            )}
            {createdOrder && paymentMethod === "ONLINE" && createdOrder.paymentStatus !== "paid" && (
              <button className="button button--primary checkout-place-order" disabled={busy} onClick={() => startOnlinePayment(pendingOnlineOrderId).catch((retryError) => setError(retryError.message))} type="button">
                {busy ? "Preparing payment…" : "Retry online payment"}
              </button>
            )}
            {(!account.user.phoneVerified || !account.user.emailVerified) && <p className="checkout-payment-note">Verify your phone and email in Account before placing an order.</p>}
          </div>

          <aside className="checkout-summary" aria-label="Order summary">
            <h3>Order summary</h3>
            <p className="checkout-summary__count">{quantity} item{quantity === 1 ? "" : "s"}</p>
            <ul>{createdOrder?.items || activeQuote?.items
              ? (createdOrder?.items || activeQuote.items).map((item) => <li key={item._id || `${item.productSlug}-${item.size}`}><span>{item.productName} · UK {item.size} × {item.quantity}</span><strong>{formatPrice(item.unitPriceInr * item.quantity)}</strong></li>)
              : items.map((item) => <li key={`${item.product.id}-${item.size}`}><span>{item.product.name} · UK {item.size} × {item.quantity}</span><strong>—</strong></li>)}</ul>
            <p><span>Items subtotal</span><strong>{displayedPricing ? formatPrice(displayedPricing.subtotalInr) : "—"}</strong></p>
            {paymentMethod === "COD" && <p><span>COD fee</span><strong>{displayedPricing ? formatPrice(displayedPricing.codFeeInr) : "—"}</strong></p>}
            {paymentMethod === "ONLINE" && <p><span>Online payment discount</span><strong>{displayedPricing ? `−${formatPrice(displayedPricing.onlineDiscountInr)}` : "—"}</strong></p>}
            <p className="checkout-summary__total"><span>Final payable amount</span><strong>{displayedPricing ? formatPrice(displayedPricing.totalInr) : "—"}</strong></p>
            <div className="checkout-delivery-summary">
              <strong>Delivering to · {createdOrder?.shippingAddress?.label || (usingNewAddress ? "New address" : selectedAddress?.label || "Choose an address")}</strong>
              <p>{createdOrder?.shippingAddress
                ? `${createdOrder.shippingAddress.recipientName}, ${createdOrder.shippingAddress.address} · ${createdOrder.shippingAddress.phone}`
                : addressSummary}</p>
            </div>
            <p className="checkout-summary__notice">{paymentMethod === "COD" ? "Payment stays pending until cash is collected by an authorized delivery workflow." : "Online payment is confirmed only after the backend verifies the provider signature and captured amount."}</p>
          </aside>
        </form>
      )}
    </dialog>
  );
}

export default CheckoutDialog;
