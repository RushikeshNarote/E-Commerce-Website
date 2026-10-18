import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { products } from "../data/products.js";

function HeroSection() {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    const logo = heroRef.current?.closest(".site-shell")?.querySelector(".site-logo");
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hero__copy > *",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            duration: 0.65,
            ease: "power2.out",
            stagger: 0.11,
            y: 0,
          },
        );
        gsap.fromTo(
          ".hero__shoe",
          { autoAlpha: 0, rotation: -11, scale: 0.78, x: 30, y: 35 },
          {
            autoAlpha: 1,
            duration: 1.05,
            ease: "power3.out",
            rotation: -4,
            scale: 1,
            x: 0,
            y: 0,
          },
        );
        gsap.fromTo(
          logo,
          { autoAlpha: 0, scale: 0.9, y: -8 },
          {
            autoAlpha: 1,
            delay: 0.08,
            duration: 0.55,
            ease: "power2.out",
            scale: 1,
            y: 0,
          },
        );
      });
    }, heroRef);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  const product = products[0];

  return (
    <section className="hero" id="top-hero" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__copy">
        <p className="eyebrow hero__eyebrow">
          <span className="status-dot" />
          The next generation of movement
        </p>
        <h1 id="hero-title">
          MOVE
          <br />
          <span>BEYOND.</span>
        </h1>
        <p className="hero__description">
          Made for the ones who never stand still. Find a new perspective on
          every step.
        </p>
        <a className="button button--primary" href="#collection">
          Explore the collection <span aria-hidden="true">↗</span>
        </a>
        <p className="hero__edition">LEGENDS / SERIES 001</p>
      </div>

      <div className="hero__visual" aria-label="Phoenix sneaker product image">
        <span className="hero__orbit hero__orbit--outer" aria-hidden="true" />
        <span className="hero__orbit hero__orbit--inner" aria-hidden="true" />
        <span className="hero__flare" aria-hidden="true" />
        <span className="hero__index" aria-hidden="true">01</span>
        <img
          alt={`${product.name} sneaker in ${product.colorway}`}
          className="hero__shoe"
          fetchPriority="high"
          height="440"
          src={product.image}
          width="574"
        />
        <div className="hero__product-label">
          <span>01 / THE ORIGINAL</span>
          <strong>PHOENIX</strong>
          <span>BLACK / BLAZE ORANGE</span>
        </div>
        <span className="hero__visual-caption">PRODUCT PHOTOGRAPHY / 2D IMAGE</span>
      </div>

      <div className="hero__meta" aria-hidden="true">
        <span>DESIGNED TO DEFY THE EXPECTED</span>
        <span>01 — 05</span>
      </div>
      <a className="scroll-cue" href="#showcase">
        <span className="scroll-cue__line" aria-hidden="true" />
        Scroll to explore
      </a>
    </section>
  );
}

export default HeroSection;
