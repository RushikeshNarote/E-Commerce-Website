# Animation System — Scroll-Driven Shoe Showcase

This document defines the animation behavior for the MERN shoe e-commerce website. Use it together with `color.md`.

## 1. Experience goal

Create a premium, immersive sneaker product showcase inspired by modern Nike-style product storytelling. Do not copy Nike branding, logos, proprietary assets, or exact website layouts. Use the project's own brand identity and licensed or original shoe assets.

The experience should feel cinematic, smooth, responsive, and product-focused—not like a collection of unrelated effects.

## 2. Recommended stack

- **GSAP + ScrollTrigger:** scroll-linked timelines, pinned sections, coordinated transforms, text reveals, and colorway transitions.
- **Three.js / React Three Fiber + Drei:** use when a real interactive 3D shoe model (`.glb` / `.gltf`) is available.
- **CSS transforms and transitions:** simple hover/focus effects and lightweight UI animation.
- **Framer Motion / Motion:** optional for ordinary React UI transitions; avoid adding overlapping animation libraries without a clear reason.

Before installing packages, inspect `package.json` and the current codebase. Reuse existing dependencies when possible and explain any new dependencies.

## 3. Animation sequence

### A. Initial page intro
1. Start with the hero background using the palette from `color.md`.
2. Fade and scale the brand wordmark into view.
3. Bring the shoe into the hero with a controlled opacity, position, and scale animation.
4. Reveal the headline and supporting copy with a small stagger.
5. Reveal the primary CTA after the main product has settled.
6. Keep the intro short and allow users to reach the content quickly.

### B. Scroll-driven hero
1. Create a dedicated product showcase section.
2. Use a GSAP timeline connected to ScrollTrigger progress.
3. Pin the showcase only for the duration needed to tell the product story.
4. Rotate and translate the shoe smoothly as the user scrolls.
5. Coordinate the headline, supporting copy, product details, and background with the same timeline.
6. Use deliberate easing for timeline transitions; avoid excessive bounce or random motion.
7. Do not hijack normal scrolling or make the page feel stuck.

### C. Colorway transitions
1. Show multiple shoe colorways, each with matching background/accent treatment.
2. If separate product images/models exist, transition between them with a crossfade and a subtle position/rotation/scale change.
3. If a single 3D model supports material changes, animate the relevant materials between colorways.
4. Update the product name, price, selected color, and accessible selection state consistently.
5. Do not pretend a single static image is a true 3D model. Use the best available assets and clearly separate fallback behavior.

### D. Product card and CTA interactions
- Product cards: subtle lift or scale on hover; no large jumps.
- Buttons: smooth color transition and a small translate effect.
- Color swatches: visible selected state, keyboard support, and an accessible label.
- Add-to-cart feedback: clear confirmation without an intrusive animation.
- Respect reduced-motion preferences.

## 4. Visual direction

Use `color.md` as the single source of truth for colors:
- Almost Black `#070D0D`: primary background.
- Blaze Orange `#FF6700`: key action and highlight color.
- Charcoal `#151B1B`: product cards and panels.
- White `#FFFFFF`: main text.
- Cool Gray `#A3A3A3`: secondary text.
- Soft Orange `#FF8533`: hover and animation accents.

Keep orange glow and lighting restrained. Preserve product readability and contrast.

## 5. Technical and implementation requirements

1. Inspect the current project structure before changing files.
2. Implement the experience within the existing React/Vite frontend and preserve the Node.js/Express/MongoDB backend and existing e-commerce functionality.
3. Prefer reusable components, for example `ProductShowcase`, `ColorwaySelector`, and `ProductCard`, where appropriate for the existing architecture.
4. Register and clean up GSAP/ScrollTrigger animations correctly in React lifecycle code to avoid duplicate timelines after rerenders or hot reload.
5. Do not animate layout properties unnecessarily. Prefer `transform` and `opacity` for performance.
6. Load large 3D models and textures lazily; compress assets and avoid loading a large model before it is needed.
7. Provide a static image fallback if WebGL is unavailable or the 3D model fails to load.
8. Ensure the layout works on desktop, tablet, and mobile. Reduce or simplify pinned/scroll-driven effects on small screens when needed.
9. Respect `prefers-reduced-motion`; provide a reduced-motion experience that avoids large spins, parallax, and long pinned sections.
10. Keep buttons, links, color selectors, and product controls accessible by keyboard and screen readers.
11. Avoid horizontal overflow, scroll-jacking, excessive blur, excessive particles, and animations that reduce text readability.
12. Do not break existing routes, authentication, cart, product data, API calls, or responsive layouts.

## 6. Suggested starting motion values

Treat these as initial design targets and adjust after testing:
- Intro logo: roughly 0.4–0.7 seconds.
- Shoe entrance: roughly 0.8–1.2 seconds.
- Text stagger: roughly 0.1–0.2 seconds between items.
- Button hover: roughly 0.2–0.3 seconds.
- Scroll-driven movement: tied to scroll progress rather than a fixed autoplay duration.
- Keep rotations controlled; use a full spin only if it serves the product story.

These are starting points, not mandatory values.

## 7. Performance and quality checks

- Test with a real mouse, trackpad, touch input, and keyboard.
- Test at narrow mobile widths and on a lower-powered device.
- Check that the hero does not flash, jump, or start at the wrong scroll position.
- Confirm animations clean up correctly during navigation and React rerenders.
- Check loading states, failed model/image loading, and WebGL fallback.
- Verify the page remains usable with reduced motion enabled.
- Keep Lighthouse performance and accessibility in mind.

## 8. Implementation workflow

1. Inspect the existing codebase and identify the current homepage, product components, routing, and dependencies.
2. Read `color.md` and this file before implementation.
3. Briefly summarize the files and components that will be changed.
4. Implement the first complete responsive version of the hero and scroll-driven showcase.
5. Reuse existing product data and working cart behavior.
6. Run the project's available lint, type-check, build, and test commands.
7. Fix errors introduced by the changes.
8. Report which files changed, which dependencies were added, and whether a real 3D model is required for the intended effect.

## 9. Asset requirement

For genuine 3D rotation and camera movement, provide a licensed or original shoe model in `.glb` or `.gltf` format. If no model exists in the repository, first build a polished fallback using the available product image and do not block the rest of the page. Do not download or use Nike logos or branded product assets without permission.
