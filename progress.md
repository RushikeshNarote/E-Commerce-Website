# LEGENDS — MOVE BEYOND

## Project progress

### Initial audit

- The project root contained `animation.md` and `color.md`, used as the primary references for visual styling and motion.
- The existing application is a React + Vite frontend in `client/`.
- No Express/Node backend, MongoDB connection or schemas, routing, authentication, product API, or existing cart/checkout implementation was present.
- The supplied logo and five sneaker images were found in `client/public/images/`.
- Product PNG and WebP files are present. The supplied sneaker artwork has an opaque, baked-in checkerboard background; it is used as-is and is not presented as transparent photography.
- No GLB/GLTF shoe model is present.

## Phase 1 — Homepage foundation

**Status: Complete**

Implemented the initial premium LEGENDS storefront homepage in the existing Vite client, using the supplied product artwork and the dark Almost Black / Blaze Orange design system.

### Files created or updated

| File | Purpose |
|---|---|
| `client/src/App.jsx` | Composes the homepage sections and manages menu, search, product-preview, and cart-preview UI state. |
| `client/src/styles.css` | Defines shared design tokens, responsive layouts, typography, card and dialog styling, focus states, hover effects, and reduced-motion behavior. |
| `client/src/data/products.js` | Centralizes product names, numbers, colorways, descriptions, WebP/PNG paths, and accent colors for Phoenix, Nova, Stealth, Terra, and Raptor. |
| `client/src/components/Navbar.jsx` | Provides responsive navigation with the supplied brand logo, search control, and clearly labeled cart-preview control. |
| `client/src/components/HeroSection.jsx` | Builds the cinematic homepage hero with Phoenix artwork, headline, CTA, visual backdrop, and entrance animation. |
| `client/src/components/ProductShowcase.jsx` | Creates the multi-product image showcase with desktop GSAP/ScrollTrigger transitions and a non-pinned mobile/reduced-motion layout. |
| `client/src/components/ProductCollection.jsx` | Renders the collection heading, product grid, and empty search-result state. |
| `client/src/components/ProductCard.jsx` | Displays each product image, name, colorway, accent, price placeholder, description, and product-preview action. |
| `client/src/components/ProductDetailsDialog.jsx` | Shows a keyboard-accessible product preview dialog and notes that pricing/specifications are not yet available. |
| `client/src/components/CartPreviewDialog.jsx` | Shows an honest empty-cart preview; it does not claim to implement cart persistence or checkout. |
| `client/src/components/Footer.jsx` | Renders the supplied logo, brand sign-off, and back-to-top link. |
| `client/package.json` | Adds GSAP as the animation dependency; React and Vite remain the existing client stack. |
| `client/package-lock.json` | Records the resolved dependency tree after adding GSAP. |

The source image files were not renamed, duplicated, or modified. Vite's generated `client/dist/` remains build output, not a source-code location.

### Validation completed

- `npm run build` succeeds.
- Editor diagnostics reported no errors in the changed source files.
- Verified HTTP 200 responses for the brand logo and every supplied PNG/WebP product asset.
- Browser checks confirmed the five showcase panels, mobile menu, product search, product preview, and cart-preview interactions.
- Checked a narrow viewport for horizontal overflow; none was found.
- Verified an example WebP is fully opaque, consistent with its checkerboard being baked into the image.

### Remaining work and limitations

- The inspected project has no backend or product/catalog API. The displayed prices are marked **TBA**.
- Cart persistence, checkout, authentication, and order handling are not implemented.
- Product visuals are static 2D image assets; genuine 3D rotation requires a suitable GLB/GLTF model.
- No lint or test scripts were present in the client package.
- The current scope is Phase 1's storefront homepage foundation. Further phases can connect real catalog data and backend commerce behavior when those systems are available.

## Phase 2 — Brand Footer and Project Credits

**Status: Complete**

### Features implemented

- Replaced the minimal footer with a responsive brand footer using the established Almost Black, Charcoal, Blaze Orange, White, and muted-gray design tokens.
- Added a separate vector footer mark: an angular orange L, LEGENDS wordmark, and MOVE BEYOND tagline.
- Added footer navigation to the existing home, collection, and story anchors. Contact links to an explicit note that project contact details have not been provided; no contact information or route has been invented.
- Added the project name, MERN project type, and a concise technology description that distinguishes the current React/Vite storefront from the wider intended MERN stack.
- Added the requested development team names and responsibilities, the faculty guidance attribution, and a dynamic copyright year with the closing brand line.
- Added responsive layouts, subtle link transitions, and visible keyboard focus styling.
- Preserved the original navbar logo and all existing homepage sections and interactions.

### Files created or modified

| File | Purpose |
|---|---|
| `client/public/images/legends-footer-logo.svg` | Reusable, original SVG footer logo variation; the navbar image remains unchanged. |
| `client/src/components/Footer.jsx` | Implements footer branding, navigation, project information, team credits, faculty guidance, and the copyright bar. |
| `client/src/styles.css` | Adds footer-specific responsive layouts, visual treatments, link interactions, and focus styling. |
| `progress.md` | Records Phase 2 implementation and validation results. |

### Footer logo asset

- `client/public/images/legends-footer-logo.svg`

### Development team

- Rushikesh Narote — Animation, 3D Asset and UI/UX Integration
- Sanket Palve — Backend Server and Node.js Integration
- Durvas Palve — Database and MongoDB Integration
- Shreyash Pagare — RESTful API Integration

### Faculty guidance

Project developed under the guidance of Professor Gajanan Kadam.

### Build and validation results

- `npm run build` from `client/` completed successfully after the footer and responsive updates.
- Editor diagnostics reported no errors in `Footer.jsx` or `styles.css`. The client has no configured lint or test script.
- The new footer SVG loaded successfully in the browser as `image/svg+xml`; its image element rendered at the expected intrinsic width.
- Confirmed the existing navbar continues to use `Brand logo with orange border.png` and renders successfully. The source logo asset was not modified.
- Verified every footer navigation link points to an existing homepage anchor: `#top`, `#collection`, `#story`, and `#contact`.
- Confirmed all five collection cards and all four developer entries remain present, and the guidance attribution matches the requested text.
- Checked responsive page widths at desktop, tablet, mobile, and narrow 320px viewport sizes; the narrow-screen hero sizing was adjusted to avoid horizontal overflow.
- Verified keyboard focus styling is visible on footer navigation links.

### Remaining issues

- No project contact details or contact route are available, so the Contact link leads to an honest footer note rather than an invented email or page.
- The broader MERN backend, checkout, authentication, and product-data integrations remain outside this footer phase.

## Phase 3 — Favicon Configuration

**Status: Complete**

### Features implemented

- Configured `client/index.html` to use `/favicon.png`, the Vite public-root asset URL.
- Set the browser title to `LEGENDS — MOVE BEYOND` and theme color to `#070D0D`.
- Used the user-provided favicon image; no new or placeholder image was generated.
- Kept the uploaded source image in `client/public/images/favicon.png` and placed a copy at `client/public/favicon.png` so the configured URL resolves.
- No obsolete default Vite favicon asset or reference was present.

### Files created or modified

| File | Purpose |
|---|---|
| `client/index.html` | Declares the PNG favicon, brand title, and theme color in the document head. |
| `client/public/favicon.png` | Public-root copy served by Vite at `/favicon.png`. |
| `progress.md` | Records Phase 3 favicon setup and validation. |

### Build and validation results

- `npm run build` from `client/` completed successfully after the provided image was added.
- The running development website returned HTTP 200 at `http://127.0.0.1:5173/`.
- `/favicon.png` returned HTTP 200 with `image/png` content type and the expected 54,792-byte image.
- Browser verification confirmed the page title, theme color, and `/favicon.png` link.

### Remaining issues

- None for the favicon configuration. The uploaded original remains at `client/public/images/favicon.png`; the served public-root image is `client/public/favicon.png`.

## Phase 4 — Demo Commerce, Cart, and Review Eligibility

**Status: Foundational implementation complete; production integrations remain**

### Features implemented

- Added a browser-only cart persisted in `localStorage`, with product-size variants, quantity changes, removal, subtotal calculation, unavailable-size handling, and visible storage errors.
- Added prices and UK sizes as explicitly labeled development/demo catalog values. They are not verified commercial prices or inventory.
- Added 15 clearly identified fictional demo reviews across the five products. They are not represented as real customer testimonials or verified purchases.
- Added accessible star ratings, review summaries, rating filters, and a product details dialog. The client-side review submission action stays unavailable and explains the server-side eligibility requirements.
- Added a checkout demonstration with shipping-field validation and an order summary. It does not create an order, charge a card, or claim a successful purchase.
- Added a separate Express/Mongoose API foundation with:
  - Email/password registration and login using bcrypt hashes and short-lived signed JWTs.
  - A MongoDB product catalog endpoint and a seed command sourced from the existing client product definitions.
  - Authenticated order drafts priced from the server catalog; submitted client prices are ignored.
  - A Razorpay order-creation endpoint protected by user ownership, a server-side credential check, amount validation, timeout, and a database reservation to guard concurrent payment initialization.
  - HMAC-verified raw-body Razorpay and delivery webhooks. Only successful captured-payment events with a matching stored amount can mark an order paid; delivery updates require a signed event and paid order.
  - Review submission restricted to the signed-in order owner after payment and delivery are confirmed server-side, with a matching product/order item and a unique one-review-per-item constraint.
- Kept the client demo cart/checkout separate from the API. Real sign-in, API-backed checkout, and review submission have not been connected to the existing UI.

### Files created or modified

**Client**

- `client/src/App.jsx` — Wires product review summaries, browser cart state, dialogs, checkout demo, and notifications.
- `client/src/data/products.js` — Adds demo INR prices and shoe-size availability.
- `client/src/data/demoReviews.js` — Adds plainly labeled fictional reviews.
- `client/src/utils/reviews.js` — Calculates review aggregates and rating distributions.
- `client/src/hooks/useCart.js` — Implements validated, size-aware localStorage demo-cart behavior.
- `client/src/components/StarRating.jsx` — Renders accessible product ratings.
- `client/src/components/ProductCard.jsx` and `client/src/components/ProductCollection.jsx` — Add size selection, demo pricing/reviews, and cart actions.
- `client/src/components/ProductDetailsDialog.jsx` — Presents product detail/review UI and checkout actions.
- `client/src/components/CartPreviewDialog.jsx` — Shows cart item variants, quantity controls, totals, and checkout entry.
- `client/src/components/CheckoutDialog.jsx` — Provides the explicitly non-payment shipping form demonstration.
- `client/src/components/Navbar.jsx` — Displays the current demo-cart item count.
- `client/src/styles.css` — Styles the ratings, sizes, cart, checkout, review content, status messages, and responsive states.

**Server**

- `server/package.json` and `server/package-lock.json` — Define the API scripts and backend dependencies; Zod is pinned to the patched 4.x line.
- `server/.gitignore` and `server/.env.example` — Ignore local secrets/dependencies and document server-side configuration placeholders.
- `server/src/app.js`, `server/src/server.js`, and `server/src/config.js` — Configure Express middleware, API routing, MongoDB startup, and required runtime settings.
- `server/src/middleware/authenticate.js` — Verifies API JWTs and resolves the authenticated account.
- `server/src/models/User.js`, `Product.js`, `Order.js`, `Review.js`, and `DeliveryWebhookEvent.js` — Define account, catalog, order/payment/delivery, review, and webhook-event persistence.
- `server/src/routes/auth.js`, `products.js`, `orders.js`, `reviews.js`, and `webhooks.js` — Implement the API behavior described above.
- `server/src/scripts/seedProducts.js` — Synchronizes the five existing client products into MongoDB.
- `server/src/utils/webhookSignatures.js` and `webhookSignatures.test.js` — Verify webhook HMACs and test signature handling.

### Build and validation results

- `npm run build` in `client/` completed successfully after the Phase 4 changes.
- `npm test` in `server/` passed: 2 tests, 0 failures.
- `npm audit --omit=dev` in `server/` reported 0 production dependency vulnerabilities after updating Zod.
- `node --check` passed for all backend JavaScript source files.
- An isolated integration smoke check against the local MongoDB service passed registration, server-side order pricing despite a forged client price, race-safe payment-order creation with a mocked provider response, signed payment and delivery webhooks, unpaid-review rejection, delivered-order review acceptance, and duplicate-review rejection. The dedicated `legends_phase4_validation` database used for this check was dropped afterward.
- Browser checks at a 327px viewport confirmed five product cards, all visible product images loaded, no horizontal document overflow, and working size selection, demo-cart updates, and checkout entry.

### Remaining issues and production requirements

- Copy `server/.env.example` to `server/.env`, set a unique random `JWT_SECRET` (at least 32 characters) and the correct `MONGODB_URI`; do not commit `.env`.
- Run `npm run seed` from `server/` before using the catalog/order endpoints.
- Real Razorpay processing requires server-side `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`, a configured Razorpay webhook endpoint, and provider-side setup. No live payment was attempted or verified.
- Real delivery status requires an actual delivery integration that signs events with `DELIVERY_WEBHOOK_SECRET`. No external delivery provider is connected.
- The frontend is not yet wired to backend registration, login, order creation, Razorpay checkout, order history, or review submission. Its cart and checkout remain demonstrations.
- Replace all demo prices with approved catalog prices and confirm inventory/size availability before accepting real orders.
- Configure production HTTPS, secret management, CORS origin, operational logging/monitoring, rate limits, privacy/data-retention practices, and account lifecycle features before deployment.
- The client package still has no lint or automated UI test script; no lint check was available to run.

## Phase 5 — Customer Accounts, Verified Contacts, Saved Addresses, GPS & Smart Checkout

**Status: Core flows implemented and locally validated; third-party production integrations require credentials**

### Features implemented

- Added a responsive Account control to the navbar and an account dialog supporting registration, sign-in/sign-out, profile edits, verified-contact status, saved addresses, and customer-owned order history.
- Restores the existing short-lived JWT session from browser storage on refresh, verifies it against the API, clears invalid sessions, and reports storage/session errors. Access tokens expire after 15 minutes; there is no refresh-token flow.
- Extended the existing `User` model with full name, normalized Indian mobile number, email/phone verification state, expiring email-code metadata, and embedded saved addresses. Profile updates cannot set verification flags; changing either contact resets that contact's verification state.
- Added authenticated phone and email verification:
  - Phone verification is delegated to Twilio Verify; the server starts and checks the provider verification, enforces a resend cooldown and attempt limit, and never returns the OTP.
  - Email codes are generated server-side, sent through Resend, stored only as SHA-256 hashes, expire after 10 minutes, are limited to five attempts, and are cleared after successful verification.
  - Missing SMS/email configuration returns an explicit unavailable response rather than simulating delivery.
- Added account-owned saved address create/list/edit/delete/default operations, Indian PIN and phone validation, optional coordinates, and immutable delivery-address snapshots on orders.
- Added opt-in browser geolocation buttons in account address management and checkout. Coordinates are sent to the configured OpenCage reverse-geocoding endpoint; returned fields remain editable and must be explicitly saved/confirmed. Permission, provider, and incomplete-address errors leave manual entry available.
- Replaced the checkout-only demo form with authenticated order placement, saved/new address selection, verified-contact gating, payment-method selection, a server-priced order summary, status feedback, and order history.
- Added server-authoritative payment pricing:
  - COD: item subtotal + ₹40 once per order; no online discount; payment remains pending until a signed, trusted cash-collection event confirms the exact amount.
  - Online: item subtotal − ₹30 once only when the server-calculated item subtotal is strictly greater than ₹100; no COD fee.
  - Client-submitted prices, fees, discounts, totals, status fields, and user IDs are not accepted by order creation.
- Added order idempotency, server catalog/size checks, address ownership checks, COD/online lifecycle states, and a safe online-payment retry that reuses the order's Razorpay provider order.
- Online checkout requests a Razorpay order for the persisted server total in paise. The browser receives only the public key ID; the server verifies the checkout signature and independently confirms captured status, amount, order, and currency with Razorpay before updating payment status. Signed payment webhooks remain enabled as a second confirmation route.
- Preserved the product collection, demo review presentation, navbar logo, footer, and scroll-driven homepage animations. Updated cart text so it no longer claims integrated checkout cannot create an order.
- No dependencies were added for this phase.

### Design-reference note

- The requested lowercase `design.md` does not exist in the project. The existing uppercase `DESIGN.md` was inspected; its pink/cream direction conflicts with the explicit LEGENDS palette, so the existing `color.md` and established Almost Black / Blaze Orange system remain authoritative. `animation.md` guidance for responsive behavior and reduced motion was preserved.

### Files created or modified

**Client**

- `client/src/App.jsx` — Owns the authenticated account hook, Account dialog, integrated checkout, and cart completion updates.
- `client/src/components/Navbar.jsx` — Adds the responsive Account option beside search and cart.
- `client/src/components/AccountDialog.jsx` — Adds registration/login, profile editing, contact verification UI, address management, manual/GPS address entry, and order history.
- `client/src/components/CheckoutDialog.jsx` — Implements account-gated address selection, COD/online choices, current totals, Razorpay checkout, server confirmation, and idempotent retry.
- `client/src/components/CartPreviewDialog.jsx` — Updates the cart summary and checkout handoff to reflect the integrated order flow while identifying catalog prices as development placeholders.
- `client/src/hooks/useAccount.js` — Adds JWT restoration, authenticated API requests, account/address state, sign-out, and expired-session handling.
- `client/src/styles.css` — Adds account/payment/address layouts, navbar sizing, focus states, responsive styles, and a reduced-motion-compatible dialog reveal.

**Server**

- `server/src/models/User.js` — Extends the existing account model for profile, verification, OTP metadata, and embedded owned addresses.
- `server/src/models/Order.js` — Adds payment method, COD/discount breakdown, address snapshot fields, idempotency key, and cash-collection timestamp.
- `server/src/config.js` and `server/.env.example` — Add server-only Twilio, Resend, OpenCage, and trusted COD collection settings alongside the existing database/JWT/Razorpay variables.
- `server/src/app.js` — Mounts account/address APIs, allows the required methods/headers, and adds account-route rate limiting.
- `server/src/middleware/authenticate.js` — Resolves the authenticated account and verification state from the signed JWT.
- `server/src/routes/auth.js` — Adds authenticated profile, phone OTP, and email verification operations while retaining register/login.
- `server/src/routes/addresses.js` — Adds user-scoped CRUD/default APIs and configured reverse geocoding.
- `server/src/routes/orders.js` — Adds server-priced COD/online order creation, idempotency, Razorpay session creation/retry, payment verification, and owner-only order history.
- `server/src/routes/webhooks.js` — Extends payment/delivery handling and adds signed COD collection confirmation.
- `server/src/utils/orderPricing.js` and `server/src/utils/orderPricing.test.js` — Centralize and test the strict threshold and single-fee/discount calculations.

### API endpoints added or updated

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/account/me`
- `POST /api/account/phone/request-otp`, `POST /api/account/phone/verify-otp`
- `POST /api/account/email/request-verification`, `POST /api/account/email/verify`
- `GET|POST /api/account/addresses`, `PATCH|DELETE /api/account/addresses/:addressId`, `POST /api/account/addresses/:addressId/default`, `POST /api/account/addresses/reverse-geocode`
- `POST /api/orders` (COD or ONLINE; requires a valid `Idempotency-Key`), `POST /api/orders/:orderId/payment`, `POST /api/orders/:orderId/verify-payment`, `GET /api/orders/mine`
- Existing `POST /api/webhooks/razorpay` and `POST /api/webhooks/delivery`; added `POST /api/webhooks/cash-collection`.

### Build, tests, and validation

- Frontend `npm run build`: passed.
- Backend `npm test`: passed, 5 tests with 0 failures, including ₹100/₹101/₹500 online thresholds and COD single-fee behavior.
- Backend `npm audit --omit=dev`: 0 production dependency vulnerabilities.
- `node --check` passed for all backend JavaScript modules and the account API hook. The Vite build parsed and bundled the React JSX components.
- `git diff --check`: passed.
- Isolated local-Mongo API integration checks passed for verification gates, address ownership, COD/online server totals, order idempotency, pending statuses, and the Razorpay paise amount.
- Mock-provider checks passed for incorrect/correct phone/email codes and reverification after contact changes. These used mocked Twilio and Resend responses; no real messages were sent.
- Mocked Razorpay server verification passed for invalid-signature rejection, captured payment/amount confirmation, and COD collection state transition. No live payment was attempted.
- Browser checks at a 320px viewport showed no horizontal document overflow, Account sign-in and saved address display, and checkout totals of ₹5,539 COD / ₹5,469 online for the Phoenix test cart. A COD order was created in an isolated test database and confirmed to remain `pending` until cash collection. Temporary test databases and local frontend/backend processes were cleaned up.

### Environment and run commands

- Copy `server/.env.example` to `server/.env`. Configure `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and the correct `CLIENT_ORIGIN`.
- Configure phone verification with `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID`.
- Configure email verification with `RESEND_API_KEY` and a verified `EMAIL_FROM` sender.
- Configure location lookup with `OPENCAGE_API_KEY`.
- Configure online payments with `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure signed cash-collection operations with `CASH_COLLECTION_WEBHOOK_SECRET`; delivery updates still require `DELIVERY_WEBHOOK_SECRET`.
- Seed and run the backend from `server/`: `npm install`, `npm run seed`, then `npm run dev`.
- Run the frontend from `client/`: `npm install`, then `npm run dev`. Set optional `VITE_API_URL` if the API is not at `http://localhost:4000/api`.

### Remaining limitations and recommended next steps

- Twilio, Resend, OpenCage, Razorpay, delivery, and cash-collection services need real account configuration and production endpoint setup. External-provider calls were tested only with local mocks or not exercised; no real SMS/email, location lookup, payment, delivery, or cash-collection event was performed.
- Product prices and size availability remain development/demo catalog values. Approve prices and connect authoritative inventory before accepting real customer orders.
- The checkout interface now calls the backend, but production payment operation requires valid Razorpay credentials/webhooks and verified contacts. A failed/missing provider configuration leaves the order unpaid; no client success callback alone changes payment status.
- COD collection requires a trusted operational integration that signs the exact order/amount event. Do not expose the cash-collection secret to the browser or a customer-operated client.
- JWTs are short-lived browser-stored bearer tokens; there is no refresh-token or password-reset flow. Consider migrating to secure HttpOnly session cookies and adding account recovery before production.
- GPS permissions and real reverse-geocoding accuracy were not exercised against an external provider; manual entry remains available.
- The client still has no dedicated lint or automated UI test script. No external service credentials are present in the repository.

## Phase 6 — Resend Email Verification

**Status: Implemented; live delivery requires provider configuration**

### Features implemented

- Replaced the direct HTTP email request with the official Resend Node.js SDK.
- Added a reusable email verification service that sends the generated code to the authenticated customer's registered email.
- Provider rejections and transport errors return a clear delivery failure without returning provider details, the OTP, or credentials.
- Provider configuration omissions return an explicit setup error. Verification state is saved only after Resend accepts the send request.
- Preserved the existing secure six-digit OTP generation, hashed storage, 10-minute expiry, 60-second resend cooldown, five-attempt limit, timing-safe comparison, and single-use verification.
- The User model's private/select-false OTP fields and backend-only verification transition are unchanged.

### Files created or modified

| File | Purpose |
|---|---|
| `server/src/config.js` | Loads and trims the existing `RESEND_API_KEY` and `EMAIL_FROM` environment settings. |
| `server/src/services/emailVerification.js` | Uses the Resend SDK and maps provider/network failures to sanitized errors. |
| `server/src/services/emailVerification.test.js` | Tests missing settings, successful send, and sanitized provider, initialization, and transport failures with a mocked SDK client. |
| `server/src/routes/auth.js` | Connects the verification request route to the email service and returns clear setup/delivery errors. |
| `server/package.json` and `server/package-lock.json` | Add and lock the official `resend` SDK dependency. |
| `server/.env.example` | Documents placeholder-only Resend API key and sender variables. |
| `progress.md` | Records this phase and its remaining provider setup. |

### Required environment variables and external setup

- Set `RESEND_API_KEY` in the ignored local `server/.env` to a newly generated Resend API key.
- Set `EMAIL_FROM` to a sender address on a domain verified in Resend, for example `LEGENDS <verify@your-domain.com>`.
- Complete Resend domain verification and its required DNS records before expecting delivery. Resend account restrictions may also limit recipients until the account/domain is verified.
- The key shared in chat is not persisted in the project; revoke it and generate a replacement before configuring local development or production.
- Restart the backend after setting either environment variable.

### Build, tests, and validation

- `npm test` from `server/` passed: 11 tests, 0 failures, including mocked email send success and sanitized provider/network failure handling.
- `git diff --check` passed.
- No live email was sent: the local `server/.env` had empty `RESEND_API_KEY` and `EMAIL_FROM` values during this change. Live delivery remains unverified until a rotated key and verified sender domain are configured.

### Remaining issues

- Real provider delivery, sender-domain DNS verification, and inbox delivery have not been tested.
- Do not commit `server/.env`, add credentials to frontend variables, or share API keys in chat.

## Phase 7 — Registration Persistence and Verification Flow

**Status: Implemented and validated against the configured MongoDB database with mocked providers**

### Findings

- The backend uses database `Legends` and the Mongoose `User` model maps to the lowercase `users` collection. Compass was showing the case-sensitive `Users` collection, which is not the collection queried by registration.
- During the investigation, a read-only count found 2 documents in `Legends.users` and 0 in `Legends.Users`. Document contents were not inspected, so this confirmed the collection mismatch but did not establish which existing account matched the attempted email.
- Registration checks normalized email with `User.exists()` before saving. Existing matching email or phone values produce a conflict response; successful registration saves immediately and does not wait for email or phone verification.
- The previous registration endpoint was already public and did not require a JWT. The expired-session message came from account startup attempting to restore a stale stored token at the same time the registration form displayed its own error.
- `dotenv/config` previously looked for `.env` relative to the process working directory. Starting the API from the repository root could therefore fail to load `server/.env`.
- At validation time, Resend API-key and sender settings were populated in the local environment, but all Twilio settings were missing. The sender domain and real provider delivery were not verified.

### Features implemented

- Registration explicitly saves email and phone as unverified, stores only the bcrypt password hash, normalizes email and Indian phone number before duplicate lookup, and returns a pending-verification success message.
- Duplicate lookups cover both email and phone. Duplicate-key races on existing unique indexes return a clear account conflict without creating a second account.
- Added `emailVerifiedAt` and `phoneVerifiedAt` fields, initialized to `null` and set only on successful verification. Changing a contact resets only that contact's verification status and timestamp.
- Email and phone verification remain independent. Successful email verification updates email fields only; successful phone verification updates phone fields only. OTP/provider failure does not mark a contact verified.
- Provider setup errors identify the required environment variable names. Twilio transport failures return a clear sanitized error without logging credentials or OTPs.
- The API now loads `server/.env` relative to its config file, regardless of the directory used to launch Node.
- Public registration/login requests no longer send a stale bearer token. The registration view clears and hides stale-session messages, and the account submit handler uses a ref lock against duplicate submissions.
- Added safe tests for the Mongoose collection mapping and initial verification defaults.

### Files created or modified

| File | Purpose |
|---|---|
| `server/src/config.js` | Loads `server/.env` from a path relative to the server config module. |
| `server/src/models/User.js` | Adds nullable verification timestamps while retaining the existing model/collection and OTP/password protections. |
| `server/src/models/User.test.js` | Verifies the `users` collection mapping and initial independent unverified status. |
| `server/src/routes/auth.js` | Adds normalized email/phone duplicate checks, clear registration response, independent verification timestamps, and sanitized provider errors. |
| `client/src/hooks/useAccount.js` | Omits stale JWTs on public auth requests and exposes session-error clearing. |
| `client/src/components/AccountDialog.jsx` | Prevents duplicate submits and avoids showing expired-session errors as registration failures. |
| `progress.md` | Records this investigation, implementation, and test evidence. |

### Verification fields

- Email: `emailVerified`, `emailVerifiedAt`; private OTP state remains `emailOtpHash`, `emailOtpExpiresAt`, `emailOtpAttempts`, and `emailOtpRequestedAt`.
- Phone: `phoneVerified`, `phoneVerifiedAt`; provider-managed OTP state remains `phoneOtpRequestedAt` and `phoneOtpAttempts`.
- Verification timestamps are returned by account payloads and refreshed with the existing `/api/auth/me` request.

### Tests and validation

- Backend `npm test`: passed, 12 tests, 0 failures.
- Frontend `npm run build`: passed.
- Backend config, route, and model syntax checks passed; `git diff --check` passed.
- Ran the registration and verification HTTP routes against the configured MongoDB database `Legends`, collection `users`, using unique temporary accounts. Confirmed one normalized account was persisted immediately with false verification statuses and a hashed password; duplicate email and phone-only conflicts returned 409 without adding another document.
- With provider settings cleared in-process, confirmed email/SMS verification requests returned configuration errors and left verification false.
- Seeded only a hashed test email OTP and mocked Twilio responses. Confirmed email verification changed only email status/timestamp, phone verification changed only phone status/timestamp, both persisted after disconnect/reconnect, and `/api/auth/me` returned the persisted statuses.
- Confirmed missing email/SMS configuration returns HTTP 503 and does not change verification statuses. No actual provider call was made in this missing-configuration test.
- Deleted only the unique temporary test account(s) created for MongoDB integration checks. Existing user documents and indexes were not modified.
- No real email or SMS was sent. Although Resend settings were populated, the configured sender domain was not validated and the test did not use live Resend credentials; Twilio was tested with mocked responses only.

### Remaining environment setup

- Use the `Legends` database and lowercase `users` collection in Compass.
- Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` in `server/.env` to enable real SMS verification.
- The Resend settings were non-empty during validation, but sender-domain validity and live email delivery still need to be verified with Resend.
- Restart the backend after environment or code changes. See `server/.env.example` for placeholder names; do not put credentials in the client or commit `server/.env`.
