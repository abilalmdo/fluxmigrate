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

    // --- contact form ----------------------------------------------------------------
    // Without script the form posts to /contact-submit.php and the server redirects (thank-you page,
    // or back here with #form-status). With script it submits in place, so an error keeps what the
    // visitor typed, and success goes to the same thank-you page.
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (form && status) {
      const stamp = form.elements.namedItem("ts");
      if (stamp) stamp.value = String(Date.now()); // the server rejects a form "filled" in under 2.5 s
      const button = form.querySelector('button[type="submit"]');
      const label = button ? button.textContent : "";
      const fallback = status.innerHTML; // generic message with the mailto link
      const showError = (message) => {
        if (message) status.textContent = message;
        else status.innerHTML = fallback;
        status.classList.add("is-visible");
        status.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        status.focus({ preventScroll: true });
      };

      // Self-hosted captcha: ask the server for a question; the signed token comes back with it.
      const captchaBox = document.getElementById("captcha-field");
      const captchaLabel = document.getElementById("captcha-label");
      const captchaInput = document.getElementById("captcha");
      const captchaToken = form.elements.namedItem("captcha_token");
      const loadCaptcha = async () => {
        if (!captchaBox || !window.fetch) return false;
        try {
          const res = await fetch("/contact-captcha.php", { headers: { Accept: "application/json" }, cache: "no-store" });
          const data = await res.json();
          if (!res.ok || !data.question || !data.token) return false;
          captchaLabel.textContent = data.question;
          captchaToken.value = data.token;
          captchaInput.value = "";
          captchaInput.required = true;
          captchaBox.hidden = false;
          return true;
        } catch {
          return false;
        }
      };
      loadCaptcha();

      form.addEventListener("submit", async (e) => {
        if (!window.fetch) return; // plain post
        e.preventDefault();
        status.classList.remove("is-visible");
        if (!captchaToken.value && !(await loadCaptcha())) {
          showError("The security check could not load. Please try again in a moment, or email us.");
          return;
        }
        if (!captchaInput.value.trim()) {
          captchaInput.focus();
          return;
        }
        if (button) {
          button.disabled = true;
          button.textContent = "Sending…";
        }
        try {
          const res = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });
          const data = await res.json();
          if (data.ok) {
            window.location.assign(data.redirect || "/thank-you.html");
            return;
          }
          showError(data.message);
          if (data.code !== "invalid") {
            // The server spends a token on every attempt that got past validation, so ask for a fresh question
            captchaToken.value = "";
            await loadCaptcha();
            if (data.code === "captcha" || data.code === "expired") captchaInput.focus();
          }
        } catch {
          showError();
          captchaToken.value = "";
          await loadCaptcha();
        }
        if (button) {
          button.disabled = false;
          button.textContent = label;
        }
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
