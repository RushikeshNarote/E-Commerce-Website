import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ProductShowcase({ products }) {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      const panels = gsap.utils.toArray(".showcase-panel", section);

      media.add(
        "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        () => {
          const images = panels.map((panel) => panel.querySelector(".showcase-panel__image"));
          const copy = panels.map((panel) => panel.querySelector(".showcase-panel__copy"));
          const glow = section.querySelector(".showcase__glow");

          gsap.set(panels.slice(1), { autoAlpha: 0 });
          gsap.set(images[0], { rotation: -7, scale: 0.82, x: 24, y: 32 });
          gsap.set(images.slice(1), { autoAlpha: 0, rotation: 8, scale: 1.1, x: -20 });
          gsap.set(copy[0].children, { autoAlpha: 0, y: 20 });

          const timeline = gsap.timeline({
            scrollTrigger: {
              anticipatePin: 1,
              end: () => `+=${window.innerHeight * (panels.length - 1)}`,
              invalidateOnRefresh: true,
              pin: section.querySelector(".showcase__pin"),
              scrub: 1,
              start: "top top",
              trigger: section,
            },
          });

          timeline.to(images[0], {
            duration: 0.5,
            rotation: -3,
            scale: 1,
            x: 0,
            y: 0,
          });
          timeline.to(
            copy[0].children,
            { autoAlpha: 1, duration: 0.35, stagger: 0.09, y: 0 },
            "<",
          );

          for (let index = 1; index < panels.length; index += 1) {
            timeline.to(
              panels[index - 1],
              { autoAlpha: 0, duration: 0.28, y: -24 },
              `step-${index}`,
            );
            timeline.to(
              panels[index],
              { autoAlpha: 1, duration: 0.35, y: 0 },
              "<0.1",
            );
            timeline.to(
              images[index - 1],
              {
                autoAlpha: 0,
                duration: 0.38,
                rotation: index % 2 ? 8 : -8,
                scale: 0.82,
                x: 24,
              },
              "<",
            );
            timeline.fromTo(
              images[index],
              { autoAlpha: 0, rotation: index % 2 ? -9 : 9, scale: 1.12, x: -24 },
              {
                autoAlpha: 1,
                duration: 0.55,
                ease: "power2.out",
                rotation: index % 2 ? -3 : 3,
                scale: 1,
                x: 0,
              },
              "<0.08",
            );
            timeline.fromTo(
              copy[index].children,
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, duration: 0.36, stagger: 0.08, y: 0 },
              "<0.05",
            );
            timeline.to(
              glow,
              { backgroundColor: products[index].accent, duration: 0.5 },
              "<",
            );
          }
        },
      );

      media.add(
        "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          panels.forEach((panel) => {
            gsap.fromTo(
              panel,
              { autoAlpha: 0, y: 26 },
              {
                autoAlpha: 1,
                duration: 0.65,
                ease: "power2.out",
                scrollTrigger: {
                  once: true,
                  start: "top 88%",
                  trigger: panel,
                },
                y: 0,
              },
            );
          });
        },
      );
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, [products]);

  return (
    <section
      aria-label="Scroll through the LEGENDS sneaker series"
      className="product-showcase"
      id="showcase"
      ref={sectionRef}
    >
      <div className="showcase__pin">
        <span className="showcase__glow" aria-hidden="true" />
        <div className="showcase__intro">
          <p className="eyebrow">Scroll-driven product story</p>
          <span>LEGENDS / 001—005</span>
        </div>
        <div className="showcase__panels">
          {products.map((product, index) => (
            <article
              aria-labelledby={`showcase-${product.id}`}
              className="showcase-panel"
              key={product.id}
            >
              <div className="showcase-panel__visual">
                <span className="showcase-panel__halo" aria-hidden="true" />
                <span className="showcase-panel__index" aria-hidden="true">
                  {product.number}
                </span>
                <img
                  alt={`${product.name} sneaker, ${product.colorway}`}
                  className="showcase-panel__image"
                  height="440"
                  loading={index === 0 ? "eager" : "lazy"}
                  src={product.image}
                  width="574"
                />
                <span className="showcase-panel__image-note">
                  2D PRODUCT PHOTOGRAPHY
                </span>
              </div>
              <div className="showcase-panel__copy">
                <p className="eyebrow">LEGENDS / {product.number}</p>
                <h2 id={`showcase-${product.id}`}>
                  {product.name}
                  <span>.</span>
                </h2>
                <p className="showcase-panel__colorway">{product.colorway}</p>
                <p className="showcase-panel__description">{product.description}</p>
                <a className="button button--outline" href="#collection">
                  Explore colorway <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="showcase__footer" aria-hidden="true">
          <span>FIVE COLORWAYS / ONE DIRECTION</span>
          <span>SCROLL TO MOVE THROUGH THE SERIES</span>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
