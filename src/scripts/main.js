/* Small UI behaviours: mobile menu, Services dropdown, header reveal, tabs, form banner. */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const XL = 1280;

  function init() {
    // --- mobile menu --------------------------------------------------------
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    const header = document.querySelector(".header");

    function setMenu(open) {
      if (!toggle || !menu) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("flex", open);
      menu.classList.toggle("flex-col", open);
      menu.classList.toggle("max-xl:max-h-[calc(100dvh-7rem)]", open);
      menu.classList.toggle("max-xl:overflow-y-auto", open);
    }
    if (toggle && menu) {
      toggle.addEventListener("click", () =>
        setMenu(toggle.getAttribute("aria-expanded") !== "true"),
      );
      menu.addEventListener("click", (e) => {
        if (e.target instanceof HTMLAnchorElement) setMenu(false);
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth >= XL) {
          setMenu(false);
          menu.classList.remove("hidden");
        } else if (toggle.getAttribute("aria-expanded") !== "true") {
          menu.classList.add("hidden");
        }
      });
    }

    // --- Services dropdown (a <details>) --------------------------------------
    const details = document.querySelector(".nav-details");
    if (details) {
      document.addEventListener("click", (e) => {
        if (details.open && !details.contains(e.target)) details.open = false;
      });
      details.addEventListener("click", (e) => {
        if (e.target instanceof HTMLAnchorElement) details.open = false;
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (details && details.open) {
        details.open = false;
        const summary = details.querySelector("summary");
        if (summary) summary.focus();
      } else if (toggle && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    // --- header hides while scrolling down, returns on scroll up ----------------
    if (header && !reduce) {
      let lastY = window.scrollY;
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY;
          const menuOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
          const dropdownOpen = details && details.open;
          if (menuOpen || dropdownOpen || y < 200 || y < lastY) header.classList.remove("hide");
          else header.classList.add("hide");
          lastY = y;
        },
        { passive: true },
      );
    }

    // --- tabs (industries) — WAI-ARIA tabs pattern ----------------------------
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
      const panels = Array.from(group.querySelectorAll('[role="tabpanel"]'));
      const select = (tab, focus) => {
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          t.classList.toggle("is-active", on);
        });
        panels.forEach((p) => {
          p.hidden = p.id !== tab.getAttribute("aria-controls");
        });
        if (focus) tab.focus();
      };
      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => select(tab, false));
        tab.addEventListener("keydown", (e) => {
          let next = null;
          if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
          else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === "Home") next = tabs[0];
          else if (e.key === "End") next = tabs[tabs.length - 1];
          if (next) {
            e.preventDefault();
            select(next, true);
          }
        });
      });
    });

    // --- contact form: confirmation after formsubmit redirects back --------------
    const sent = document.getElementById("sent-banner");
    if (sent && new URLSearchParams(window.location.search).get("sent") === "1") {
      sent.hidden = false;
      sent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
