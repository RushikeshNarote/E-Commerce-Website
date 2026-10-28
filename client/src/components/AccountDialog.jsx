import { useEffect, useRef, useState } from "react";

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  houseFlat: "",
  street: "",
  locality: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  latitude: null,
  longitude: null,
  isDefault: false,
};

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function AddressFields({ value, onChange, onLocate, locating, locationError }) {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value });
  return (
    <div className="account-address-form">
      <label>Address label
        <select value={value.label} onChange={set("label")}>
          <option>Home</option><option>Work</option><option>Other</option>
        </select>
      </label>
      <div className="checkout-form__row">
        <label>Recipient name<input autoComplete="name" maxLength="100" required value={value.recipientName} onChange={set("recipientName")} /></label>
        <label>Contact phone<input autoComplete="tel-national" inputMode="tel" maxLength="10" pattern="[6-9][0-9]{9}" required value={value.phone} onChange={set("phone")} /></label>
      </div>
      <label>House / flat<input autoComplete="address-line1" maxLength="100" required value={value.houseFlat} onChange={set("houseFlat")} /></label>
      <label>Building / street<input autoComplete="address-line2" maxLength="160" required value={value.street} onChange={set("street")} /></label>
      <label>Area / locality<input maxLength="120" required value={value.locality} onChange={set("locality")} /></label>
      <label>Landmark (optional)<input maxLength="120" value={value.landmark} onChange={set("landmark")} /></label>
      <div className="checkout-form__row">
        <label>City<input autoComplete="address-level2" maxLength="80" required value={value.city} onChange={set("city")} /></label>
        <label>State<input autoComplete="address-level1" maxLength="80" required value={value.state} onChange={set("state")} /></label>
      </div>
      <label>PIN code<input autoComplete="postal-code" inputMode="numeric" maxLength="6" pattern="[1-9][0-9]{5}" required value={value.postalCode} onChange={set("postalCode")} /></label>
      <button className="button button--outline account-location" disabled={locating} onClick={onLocate} type="button">
        {locating ? "Finding your location…" : "Use My Current Location"}
      </button>
      {locationError && <p className="checkout-message checkout-message--error" role="alert">{locationError}</p>}
      {value.latitude != null && <p className="account-location__note" role="status">Coordinates attached. Review the populated fields before saving.</p>}
    </div>
  );
}

function AccountDialog({ account, onClose }) {
  const dialogRef = useRef(null);
  const submitLockRef = useRef(false);
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [credentials, setCredentials] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [addressDraft, setAddressDraft] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (!account.user) return;
    setProfile({
      fullName: account.user.fullName || "",
      email: account.user.email || "",
      phone: account.user.phone || "",
    });
    account.request("/orders/mine").then(({ orders: result }) => {
      setOrders(result || []);
      setOrdersError("");
    }).catch((requestError) => setOrdersError(requestError.message));
  }, [account.user, account.request]);

  async function submit(action) {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  async function updateLocation(onAddress) {
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable in this browser. You can enter the address manually.");
      return;
    }
    setLocationBusy(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await account.request("/account/addresses/reverse-geocode", {
          method: "POST",
          body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
        });
        onAddress((current) => ({ ...current, ...result.address }));
      } catch (requestError) {
        setLocationError(`${requestError.message} Enter the address manually if needed.`);
      } finally {
        setLocationBusy(false);
      }
    }, (geoError) => {
      const message = geoError.code === 1
        ? "Location permission was denied. You can enter the address manually."
        : geoError.code === 3
          ? "Location lookup timed out. Try again or enter the address manually."
          : "Current location is unavailable. You can enter the address manually.";
      setLocationError(message);
      setLocationBusy(false);
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 });
  }

  async function saveProfile(event) {
    event.preventDefault();
    await submit(async () => {
      const response = await account.request("/account/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      account.setUser(response.user);
      setNotice("Profile saved. Changed contact details need fresh verification.");
    });
  }

  async function saveAddress(event) {
    event.preventDefault();
    await submit(async () => {
      const path = editingAddressId
        ? `/account/addresses/${editingAddressId}`
        : "/account/addresses";
      const result = await account.updateAddresses(
        path,
        editingAddressId ? "PATCH" : "POST",
        addressDraft,
      );
      if (result.user) account.setUser(result.user);
      setAddressDraft(null);
      setEditingAddressId("");
      setNotice("Saved delivery address updated.");
    });
  }

  return (
    <dialog
      aria-labelledby="account-title"
      className="site-dialog account-dialog"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <button aria-label="Close account" className="dialog-close" onClick={onClose} type="button">×</button>
      <p className="eyebrow">LEGENDS / CUSTOMER ACCOUNT</p>
      <h2 id="account-title" className="account-dialog__title">{account.user ? "Your account." : "Welcome back."}</h2>
      {error && <p className="checkout-message checkout-message--error" role="alert">{error}</p>}
      {notice && <p className="checkout-message checkout-message--info" role="status">{notice}</p>}
      {mode === "login" && account.sessionError && !account.user && !account.loading && <p className="checkout-message checkout-message--error" role="alert">{account.sessionError}</p>}

      {account.loading ? <p role="status">Restoring your secure session…</p> : null}
      {!account.user && !account.loading && (
        <section className="account-auth">
          <div className="account-tabs" aria-label="Account action">
            <button aria-pressed={mode === "login"} onClick={() => { setMode("login"); setError(""); setNotice(""); }} type="button">Sign in</button>
            <button aria-pressed={mode === "register"} onClick={() => { setMode("register"); setError(""); setNotice(""); account.clearSessionError(); }} type="button">Create account</button>
          </div>
          <form className="checkout-form" onSubmit={(event) => {
            event.preventDefault();
            submit(async () => {
              const password = credentials.password;
              if (password.length < 5) throw new Error("Password must be at least 5 characters.");
              if (password.length > 128) throw new Error("Password must not exceed 128 characters.");
              if (new TextEncoder().encode(password).length > 72) {
                throw new Error("Password must not exceed 72 UTF-8 bytes.");
              }
              const path = mode === "register" ? "/auth/register" : "/auth/login";
              if (mode === "register") account.clearSessionError();
              await account.authenticate(path, credentials);
              setNotice(mode === "register"
                ? "Account created. Verify your email and phone before placing an order."
                : "You are signed in.");
            });
          }}>
            {mode === "register" && <>
              <label>Full name<input autoComplete="name" maxLength="100" required value={credentials.fullName} onChange={(event) => setCredentials({ ...credentials, fullName: event.target.value })} /></label>
              <label>Indian mobile number<input autoComplete="tel" inputMode="tel" placeholder="10-digit number" required value={credentials.phone} onChange={(event) => setCredentials({ ...credentials, phone: event.target.value })} /></label>
            </>}
            <label>Email address<input autoComplete="email" required type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
            <label>Password<input autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={5} maxLength={128} required type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>
            <p className="account-muted">Use at least 5 characters (maximum 128 characters and 72 UTF-8 bytes).</p>
            <button className="button button--primary" disabled={busy} type="submit">{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
          </form>
          <p className="account-muted">A valid account session is required for saved addresses and order placement.</p>
        </section>
      )}

      {account.user && (
        <div className="account-content">
          <section className="account-section">
            <div className="account-section__heading"><h3>Profile & contact verification</h3><button className="account-signout" onClick={() => { account.signOut(); setNotice("You have signed out."); }} type="button">Sign out</button></div>
            <form className="checkout-form" onSubmit={saveProfile}>
              <label>Full name<input autoComplete="name" maxLength="100" required value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></label>
              <label>Email address<input autoComplete="email" required type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
              <label>Indian mobile number<input autoComplete="tel" inputMode="tel" required value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
              <button className="button button--outline" disabled={busy} type="submit">Save profile</button>
            </form>
            <div className="account-verification">
              <section>
                <p>Email status: <strong>{account.user.emailVerified ? "Verified" : "Not verified"}</strong></p>
                {!account.user.emailVerified && <>
                  <button className="button button--outline" disabled={busy} onClick={() => submit(async () => { const result = await account.request("/account/email/request-verification", { method: "POST" }); setNotice(result.message); })} type="button">Send email code</button>
                  <form onSubmit={(event) => { event.preventDefault(); submit(async () => { const result = await account.request("/account/email/verify", { method: "POST", body: JSON.stringify({ code: emailCode }) }); account.setUser(result.user); setEmailCode(""); setNotice(result.message); }); }}>
                    <label>Email code<input autoComplete="one-time-code" inputMode="numeric" maxLength="6" required value={emailCode} onChange={(event) => setEmailCode(event.target.value)} /></label>
                    <button className="button button--primary" disabled={busy} type="submit">Verify email</button>
                  </form>
                </>}
              </section>
              <section>
                <p>Phone status: <strong>{account.user.phoneVerified ? "Verified" : "Not verified"}</strong></p>
                {!account.user.phoneVerified && <>
                  <button className="button button--outline" disabled={busy} onClick={() => submit(async () => { const result = await account.request("/account/phone/request-otp", { method: "POST", body: JSON.stringify({ phone: profile.phone }) }); setNotice(result.message); await account.refresh(); })} type="button">Send phone code</button>
                  <form onSubmit={(event) => { event.preventDefault(); submit(async () => { const result = await account.request("/account/phone/verify-otp", { method: "POST", body: JSON.stringify({ code: phoneCode }) }); account.setUser(result.user); setPhoneCode(""); setNotice(result.message); }); }}>
                    <label>SMS code<input autoComplete="one-time-code" inputMode="numeric" maxLength="10" required value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} /></label>
                    <button className="button button--primary" disabled={busy} type="submit">Verify phone</button>
                  </form>
                </>}
              </section>
            </div>
          </section>

          <section className="account-section">
            <div className="account-section__heading"><h3>Saved delivery addresses</h3>{!addressDraft && <button className="button button--outline" onClick={() => { setAddressDraft({ ...emptyAddress, recipientName: profile.fullName, phone: profile.phone }); setEditingAddressId(""); }} type="button">Add address</button>}</div>
            {addressDraft && <form className="checkout-form" onSubmit={saveAddress}>
              <AddressFields value={addressDraft} onChange={setAddressDraft} onLocate={() => updateLocation(setAddressDraft)} locating={locationBusy} locationError={locationError} />
              <label className="account-checkbox"><input checked={addressDraft.isDefault} onChange={(event) => setAddressDraft({ ...addressDraft, isDefault: event.target.checked })} type="checkbox" /> Set as default address</label>
              <div className="account-actions"><button className="button button--primary" disabled={busy} type="submit">Save address</button><button className="button button--outline" onClick={() => setAddressDraft(null)} type="button">Cancel</button></div>
            </form>}
            <div className="account-address-list">
              {account.addresses.map((address) => (
                <article className="account-address-card" key={address._id}>
                  <div><strong>{address.recipientName}</strong> · {address.label} {address.isDefault && <span className="account-default">DEFAULT</span>}</div>
                  <p>{[address.houseFlat, address.street, address.locality, address.landmark, address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{address.phone}</p>
                  <div className="account-actions">
                    {!address.isDefault && <button className="account-text-button" onClick={() => submit(async () => { const result = await account.updateAddresses(`/account/addresses/${address._id}/default`, "POST"); account.setAddresses(result.addresses); })} type="button">Set default</button>}
                    <button className="account-text-button" onClick={() => {
                      const fields = Object.fromEntries(
                        Object.keys(emptyAddress).map((key) => [key, address[key] ?? emptyAddress[key]]),
                      );
                      setEditingAddressId(address._id);
                      setAddressDraft({ ...emptyAddress, ...fields });
                      setLocationError("");
                    }} type="button">Edit</button>
                    <button className="account-text-button account-text-button--danger" onClick={() => submit(async () => { const result = await account.updateAddresses(`/account/addresses/${address._id}`, "DELETE"); account.setAddresses(result.addresses); })} type="button">Delete</button>
                  </div>
                </article>
              ))}
              {!account.addresses.length && !addressDraft && <p className="account-muted">Add an address to make checkout quicker.</p>}
            </div>
          </section>

          <section className="account-section">
            <h3>Order history</h3>
            {ordersError && <p className="checkout-message checkout-message--error" role="alert">{ordersError}</p>}
            {orders.length ? orders.map((order) => <article className="account-order" key={order._id}>
              <header><strong>Order {order._id.slice(-8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></header>
              <p>{order.items.map((item) => `${item.productName} · UK ${item.size} × ${item.quantity}`).join(" / ")}</p>
              <p>{order.paymentMethod} · Order: {order.orderStatus} · Payment: {order.paymentStatus} · Delivery: {order.deliveryStatus}</p>
              <p>Subtotal {formatPrice(order.subtotalInr)} · COD fee {formatPrice(order.codFeeInr || 0)} · Online discount −{formatPrice(order.onlineDiscountInr || 0)} · <strong>{formatPrice(order.totalInr)}</strong></p>
              <p>{order.shippingAddress?.address}</p>
            </article>) : !ordersError && <p className="account-muted">No orders yet.</p>}
          </section>
        </div>
      )}
    </dialog>
  );
}

export default AccountDialog;
