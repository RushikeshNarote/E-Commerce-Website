# LEGENDS — MOVE BEYOND

## Project Overview

- **Project:** LEGENDS — MOVE BEYOND, a sneaker e-commerce website.
- **Frontend:** React 19, Vite 6, GSAP.
- **Backend:** Node.js, Express 5, Mongoose 8; MongoDB is configured through `MONGODB_URI`.
- **Repository:** https://github.com/RushikeshNarote/E-Commerce-Website
- **Current Git branch:** `main`.

## Completed Features

- Responsive storefront with a cinematic intro, hero, animated product showcase, five-product collection, product details, account/cart dialogs, and project footer.
- Intro at `/` uses the existing `client/public/images/legends-footer-logo.svg`; its CTA enters the existing storefront. Direct product/store hash navigation remains available.
- Registration and login API with password hashing, JWT authentication, account profile and address APIs.
- Independent email and phone verification flows. OTP state is protected in the user model; delivery requires valid Resend and Twilio configuration.
- MongoDB-backed product catalog, server-priced orders, idempotency, COD and Razorpay order/payment flows, signed payment/delivery/cash-collection webhook handlers, and order history.
- Browser cart persists in `localStorage`. The displayed prices, sizes, and inventory are demo catalog values.
- Product ratings/reviews shown in the UI are fictional demo data. The backend has order-eligibility checks for review submissions; the storefront does not currently submit reviews.

## MongoDB Verification

- The project connects using the `MONGODB_URI` setting; the Mongoose `User` model uses the lowercase `users` collection.
- The project owner reports checking MongoDB Compass and seeing user documents in `Legends.users`, with fields including `emailVerified`, `phoneVerified`, `createdAt`, and `updatedAt`.
- The records they observed had `emailVerified` and `phoneVerified` set to `false`. This describes the observed records only; verification status can differ between accounts.
- No personal user data or database exports are recorded here.

## Current Status

### Implemented and verified

- Client production build succeeds.
- Backend unit tests cover user-model defaults, password validation, order pricing, email delivery error handling, and webhook signatures.
- Prior local integration checks recorded in project history exercised registration/verification persistence, account and address ownership, server-side order pricing, payment/webhook validation, and review eligibility using isolated test data or mocked providers.
- Intro logo loading, responsive centering, CTA transition, and existing storefront dialogs have been browser-checked.

### Implemented but not fully tested

- Live email/SMS delivery, address geocoding, Razorpay payments, and signed delivery or cash-collection events require real provider credentials and production setup; no live provider transaction or message is confirmed.
- Checkout and order flows require the backend, MongoDB, and configured external services. They are not confirmed as production-ready.
- Existing account, checkout, order, and webhook flows have not been comprehensively retested as part of the current documentation/push task.

### Pending or incomplete

- Confirm approved commercial pricing and authoritative inventory before accepting orders.
- Configure and validate production provider accounts, webhook endpoints, HTTPS, CORS origins, and secret management.
- Add customer review submission to the UI if desired; replace fictional demo reviews before production.
- Configure and verify hosting. No Vercel configuration or successful deployment was found in the repository.
- Add frontend lint and automated UI tests; the client currently defines build/dev/preview scripts only.

### Known limitations

- No password-reset or session-refresh flow; the client stores short-lived JWTs in browser storage.
- Product artwork is static; no GLB/GLTF model is present.
- External integrations and deployment have not been verified against production services.

## Recent Changes

- Latest existing commit on `main`: `55966ae` — “Fix registration and email-phone verification”.
- This project update adds the isolated cinematic intro, uses the footer SVG as its centered responsive logo, and transitions to the existing storefront without adding a router.
- The unrelated, untracked root `package-lock.json` is intentionally excluded from the project commit.

## GitHub and Deployment

- `origin` points to https://github.com/RushikeshNarote/E-Commerce-Website.
- The current branch is `main`; deployment status is not verified.
- No `vercel.json`, `.vercel` project directory, or verified Vercel deployment was found.
