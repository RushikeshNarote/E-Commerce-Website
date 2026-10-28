import { useEffect, useRef } from "react";
import "./IntroLanding.css";

function IntroLanding({ isExiting, onEnter }) {
  const landingRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const landing = landingRef.current;
    if (!landing) return undefined;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    function renderGlow() {
      frameRef.current = 0;
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      landing.style.setProperty("--legends-intro-pointer-x", `${current.x}px`);
      landing.style.setProperty("--legends-intro-pointer-y", `${current.y}px`);

      if (
        Math.abs(target.x - current.x) > 0.2 ||
        Math.abs(target.y - current.y) > 0.2
      ) {
        frameRef.current = window.requestAnimationFrame(renderGlow);
      } else {
        current.x = target.x;
        current.y = target.y;
        landing.style.setProperty("--legends-intro-pointer-x", `${current.x}px`);
        landing.style.setProperty("--legends-intro-pointer-y", `${current.y}px`);
      }
    }

    function moveGlow(event) {
      if (event.pointerType === "touch") return;
      const bounds = landing.getBoundingClientRect();
      target.x = Math.min(bounds.width, Math.max(0, event.clientX - bounds.left));
      target.y = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));

      if (motionPreference.matches) {
        current.x = target.x;
        current.y = target.y;
        landing.style.setProperty("--legends-intro-pointer-x", `${current.x}px`);
        landing.style.setProperty("--legends-intro-pointer-y", `${current.y}px`);
        return;
      }

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(renderGlow);
      }
    }

    function resetGlow() {
      const bounds = landing.getBoundingClientRect();
      target.x = bounds.width / 2;
      target.y = bounds.height / 2;

      if (motionPreference.matches) {
        current.x = target.x;
        current.y = target.y;
        landing.style.setProperty("--legends-intro-pointer-x", `${current.x}px`);
        landing.style.setProperty("--legends-intro-pointer-y", `${current.y}px`);
        return;
      }

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(renderGlow);
      }
    }

    landing.addEventListener("pointermove", moveGlow);
    landing.addEventListener("pointerleave", resetGlow);

    return () => {
      landing.removeEventListener("pointermove", moveGlow);
      landing.removeEventListener("pointerleave", resetGlow);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <main
      aria-label="LEGENDS — Move Beyond"
      className={`legends-intro${isExiting ? " legends-intro--exiting" : ""}`}
      ref={landingRef}
    >
      <div aria-hidden="true" className="legends-intro__ambient" />
      <div aria-hidden="true" className="legends-intro__cursor-glow" />
      <div className="legends-intro__composition">
        <div className="legends-intro__logo">
          <img
            alt="LEGENDS — MOVE BEYOND"
            decoding="async"
            src="/images/legends-footer-logo.svg"
          />
        </div>
        <button
          className="legends-intro__enter"
          disabled={isExiting}
          onClick={onEnter}
          type="button"
        >
          <span>ENTER THE EXPERIENCE</span>
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M3.5 10h12m-5-5 5 5-5 5" />
          </svg>
        </button>
      </div>
      <p className="legends-intro__caption">AN EXPERIENCE BY LEGENDS</p>
    </main>
  );
}

export default IntroLanding;
