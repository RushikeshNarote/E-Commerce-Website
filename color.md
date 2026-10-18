# Website Color System — Blaze Orange

This document defines the color palette and usage rules for the MERN Stack shoe e-commerce website, with a dark, premium, futuristic sneaker aesthetic.

## 1. Brand direction

- **Style:** Premium, sporty, futuristic, cinematic
- **Primary combination:** Blaze Orange + Almost Black
- **Design principle:** Dark-first UI with orange used selectively for emphasis
- **Suggested distribution:** 65% dark background, 15% charcoal surfaces, 12% white/gray content, 8% orange accents. Treat this as a guideline, not a strict rule.

## 2. Color tokens

| Token | Hex | Purpose |
|---|---|---|
| `--color-primary` | `#FF6700` | Main brand accent, primary CTA buttons, prices, active states |
| `--color-primary-hover` | `#FF8533` | Hover states, subtle glow and animation highlights |
| `--color-bg` | `#070D0D` | Main page background, navbar, footer, dark 3D scenes |
| `--color-surface` | `#151B1B` | Product cards, panels, dropdowns, modals, sidebars |
| `--color-surface-hover` | `#202828` | Hovered cards and secondary interactive surfaces |
| `--color-text` | `#FFFFFF` | Main headings, product names, primary text |
| `--color-text-muted` | `#A3A3A3` | Descriptions, labels, secondary text |
| `--color-border` | `#343939` | Dividers, subtle outlines, card borders |
| `--color-success` | `#35C98A` | Success messages and completed states |
| `--color-error` | `#FF4D4F` | Validation errors and failure states |

## 3. Where to use colors

### Global layout
- **Body/page background:** `#070D0D`
- **Navbar and footer:** `#070D0D`
- **Secondary sections and panels:** `#151B1B`
- **Borders and dividers:** `#343939`

### Typography
- **Headings and important text:** `#FFFFFF`
- **Body descriptions and secondary labels:** `#A3A3A3`
- **Highlighted words, prices, and small brand accents:** `#FF6700`

### Buttons and interaction
- **Primary buttons:** background `#FF6700`, text `#070D0D`
- **Primary button hover:** background `#FF8533`
- **Secondary buttons:** transparent or `#151B1B`, border `#343939`, text `#FFFFFF`
- **Active navigation and selected sizes:** `#FF6700`
- **Focus indicators:** use a visible orange outline, with sufficient spacing from nearby elements

### Product cards
- **Card background:** `#151B1B`
- **Product name:** `#FFFFFF`
- **Price:** `#FF6700`
- **Description/specifications:** `#A3A3A3`
- **Card border:** `#343939`
- **Hover surface:** `#202828`

### Hero section and 3D scenes
- Use `#070D0D` as the base.
- Use white for large headlines and orange for a short highlighted phrase.
- Let the sneaker model remain the visual focus.
- Use restrained orange rim lighting, glow, particles, and scroll-transition accents.
- Avoid large, saturated orange backgrounds behind every section; orange should guide attention rather than overwhelm the product.

### Cart, checkout, and forms
- **Page background:** `#070D0D`
- **Form fields and summary panels:** `#151B1B`
- **Input text:** `#FFFFFF`
- **Placeholder/helper text:** `#A3A3A3`
- **Borders:** `#343939`
- **Checkout/Buy Now buttons:** `#FF6700`
- **Success/error states:** use the designated semantic tokens and include text or icons, not color alone.

## 4. CSS variables

Add these tokens to the global stylesheet, such as `src/index.css`:

```css
:root {
  /* Brand */
  --color-primary: #FF6700;
  --color-primary-hover: #FF8533;

  /* Backgrounds and surfaces */
  --color-bg: #070D0D;
  --color-surface: #151B1B;
  --color-surface-hover: #202828;

  /* Text */
  --color-text: #FFFFFF;
  --color-text-muted: #A3A3A3;

  /* Borders and semantic states */
  --color-border: #343939;
  --color-success: #35C98A;
  --color-error: #FF4D4F;

  /* Shape */
  --radius-card: 16px;
  --radius-button: 8px;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

.primary-button {
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  border-radius: var(--radius-button);
  padding: 12px 24px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;
}

.primary-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.product-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}
```

## 5. Implementation rules

1. Reuse the CSS variables instead of scattering raw hex codes across components.
2. Keep the same color meaning throughout the site: orange means action, selection, or emphasis.
3. Avoid using orange for long paragraphs or large areas of body text.
4. Keep text readable against its background. Check contrast for small text, muted labels, button text, and disabled states.
5. Do not communicate success, errors, or selection using color alone; add labels, icons, or other cues.
6. Keep hover, focus, active, disabled, loading, and error states visually distinct.
7. Apply this palette consistently across the homepage, product listing, product detail, cart, checkout, authentication, and admin pages.
8. For 3D scenes, match the UI palette while keeping lighting subtle enough that the shoe and its materials remain visible.

## 6. Quick reference

- **Main background:** `#070D0D`
- **Brand orange:** `#FF6700`
- **Cards/panels:** `#151B1B`
- **Main text:** `#FFFFFF`
- **Muted text:** `#A3A3A3`
- **Borders:** `#343939`
- **Hover orange:** `#FF8533`

Use this file as the single source of truth for the website's color decisions.
