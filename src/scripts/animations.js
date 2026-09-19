import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sporeCanvas } from "./particleCanvas.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hero product image: scroll-scrubbed 3D tilt that settles flat as it reaches the viewport.
function heroTilt() {
  const targets = document.querySelectorAll("[data-hero-tilt]");
  if (!targets.length || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  targets.forEach((el) => {
    mm.add("(min-width: 1280px)", () => {
      gsap.set(el, { scale: 0.8, rotationX: 10, top: -250 });
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: "20% 95%", end: "0% 30%", scrub: true },
        scale: 1,
        rotationX: 0,
        top: 0,
        ease: "none",
      });
    });
    mm.add("(max-width: 1279px)", () => {
      gsap.set(el, { scale: 0.8, rotationX: 15 });
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: "20% 95%", end: "0% 40%", scrub: true },
        scale: 1,
        rotationX: 0,
        ease: "none",
      });
    });
  });

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
}

function init() {
  heroTilt();
  sporeCanvas(".heroSporeCanvas", { count: 140, size: 800 });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
