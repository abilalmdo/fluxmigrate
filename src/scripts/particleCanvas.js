"use strict";

/**
 * Drifting-spore canvas used behind hero areas.
 *
 * Differences from the theme's original:
 *  - the canvas is sized to what is actually shown (the theme created a 2000x2000 canvas
 *    per instance and repainted it every frame, off-screen or not)
 *  - each instance only animates while it is on screen and the tab is visible
 *  - visitors who ask for reduced motion get a single still frame
 */
export function sporeCanvas(selector, opts = {}) {
  const {
    count = 140,
    minSize = 0.2,
    maxSize = 1.6,
    minSpeed = 0,
    maxSpeed = 0.1,
    size = 800,
  } = opts;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.innerWidth < 768;
  const particleCount = small ? Math.min(count, 20) : count;
  const px = small ? Math.min(size, 640) : size;

  document.querySelectorAll(selector).forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = px;
    canvas.height = px;

    const make = (initial) => ({
      x: Math.random() * px,
      y: initial ? Math.random() * px : px + Math.random() * 20,
      r: Math.random() * (maxSize - minSize) + minSize,
      vy: Math.random() * (maxSpeed - minSpeed) - maxSpeed,
    });
    const particles = Array.from({ length: particleCount }, () => make(true));

    const draw = () => {
      ctx.clearRect(0, 0, px, px);
      ctx.fillStyle = "#FFFFFF";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    if (reduce) return;

    let running = false;
    let visible = true;
    const frame = () => {
      if (!running) return;
      for (const p of particles) {
        p.y += p.vy;
        if (p.y < -20) Object.assign(p, make(false));
      }
      draw();
      requestAnimationFrame(frame);
    };
    const sync = () => {
      const should = visible && !document.hidden;
      if (should && !running) {
        running = true;
        requestAnimationFrame(frame);
      } else if (!should) {
        running = false;
      }
    };
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        sync();
      },
      { rootMargin: "100px" },
    ).observe(canvas);
    document.addEventListener("visibilitychange", sync);
  });
}
