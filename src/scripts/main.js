/* Small UI behaviours: mobile menu, Services dropdown, header reveal, tabs, form banner, newsletter popup. */
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

    // --- forms that post to our own PHP endpoints ----------------------------------------
    // Without script a form posts normally and the server redirects. With script it submits in place,
    // so an error keeps what the visitor typed. Each form asks /contact-captcha.php for a question
    // (self-hosted captcha, FM-107); the signed token comes back with it and works once.
    function wireForm(o) {
      const form = document.getElementById(o.form);
      const status = document.getElementById(o.status);
      if (!form || !status) return null;
      const stamp = form.elements.namedItem("ts");
      if (stamp) stamp.value = String(Date.now()); // the server rejects a form "filled" in under 2.5 s
      const button = form.querySelector('button[type="submit"]');
      const label = button ? button.textContent : "";
      const fallback = status.innerHTML; // generic message (may carry a mailto link)
      const showError = (message) => {
        if (message) status.textContent = message;
        else status.innerHTML = fallback;
        status.classList.add("is-visible");
        status.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        status.focus({ preventScroll: true });
      };

      const captchaBox = document.getElementById(o.captcha + "-field");
      const captchaLabel = document.getElementById(o.captcha + "-label");
      const captchaInput = document.getElementById(o.captcha);
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
      if (!o.lazy) loadCaptcha();

      form.addEventListener("submit", async (e) => {
        if (!window.fetch) return; // plain post
        e.preventDefault();
        status.classList.remove("is-visible");
        if (!captchaToken.value && !(await loadCaptcha())) {
          showError("The security check could not load. Please try again in a moment.");
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
            if (o.onSuccess) o.onSuccess();
            window.location.assign(data.redirect || o.redirect);
            return;
          }
          showError(data.message);
          if (!["invalid", "consent"].includes(data.code)) {
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
      return { loadCaptcha };
    }

    wireForm({ form: "contact-form", status: "form-status", captcha: "captcha", redirect: "/thank-you.html" });

    // custom dropdowns for the contact form selects. The native <select> stays in the DOM (hidden) so the form
    // still posts it and works without script; the listbox below only mirrors it.
    document.querySelectorAll("#contact-form select.form-field").forEach((native) => {
      const label = document.querySelector(`label[for="${native.id}"]`);
      const wrap = document.createElement("div");
      wrap.className = "fm-select";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "form-field fm-select-btn";
      btn.setAttribute("aria-haspopup", "listbox");
      btn.setAttribute("aria-expanded", "false");
      if (label) {
        label.id = label.id || native.id + "-label";
        btn.setAttribute("aria-labelledby", label.id);
      }
      const value = document.createElement("span");
      btn.append(value);
      btn.insertAdjacentHTML("beforeend", '<svg class="fm-select-chevron" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      const list = document.createElement("ul");
      list.className = "fm-select-list";
      list.setAttribute("role", "listbox");
      list.tabIndex = -1;
      if (label) list.setAttribute("aria-labelledby", label.id);
      const opts = [...native.options].map((o, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.id = `${native.id}-opt-${i}`;
        li.className = "fm-select-opt";
        li.innerHTML = '<span></span><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        li.firstChild.textContent = o.textContent;
        list.append(li);
        return li;
      });
      let active = native.selectedIndex;
      const sync = () => {
        value.textContent = native.options[native.selectedIndex]?.textContent || "";
        opts.forEach((li, i) => li.setAttribute("aria-selected", String(i === native.selectedIndex)));
      };
      const setActive = (i) => {
        active = Math.max(0, Math.min(opts.length - 1, i));
        opts.forEach((li, j) => li.classList.toggle("is-active", j === active));
        btn.setAttribute("aria-activedescendant", opts[active].id);
        opts[active].scrollIntoView({ block: "nearest" });
      };
      const isOpen = () => wrap.classList.contains("is-open");
      const open = () => {
        wrap.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        setActive(native.selectedIndex);
      };
      const close = () => {
        wrap.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.removeAttribute("aria-activedescendant");
      };
      const choose = (i) => {
        native.selectedIndex = i;
        native.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
      };
      btn.addEventListener("click", () => (isOpen() ? close() : open()));
      opts.forEach((li, i) => {
        li.addEventListener("mousemove", () => setActive(i));
        li.addEventListener("click", () => {
          choose(i);
          btn.focus();
        });
      });
      let typed = "";
      let typedTimer;
      btn.addEventListener("keydown", (e) => {
        const k = e.key;
        const printable = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !(k === " " && !typed);
        if (!isOpen()) {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k) && !printable) {
            e.preventDefault();
            open();
          }
        } else if (k === "ArrowDown") {
          e.preventDefault();
          setActive(active + 1);
        } else if (k === "ArrowUp") {
          e.preventDefault();
          setActive(active - 1);
        } else if (k === "Home" || k === "End") {
          e.preventDefault();
          setActive(k === "Home" ? 0 : opts.length - 1);
        } else if (k === "Enter" || (k === " " && !printable)) {
          e.preventDefault();
          choose(active);
        } else if (k === "Escape") {
          e.preventDefault();
          close();
        } else if (k === "Tab") {
          close();
        }
        if (printable) {
          typed += k.toLowerCase();
          clearTimeout(typedTimer);
          typedTimer = setTimeout(() => (typed = ""), 600);
          const hit = [...native.options].findIndex((o) => o.textContent.toLowerCase().startsWith(typed));
          if (hit >= 0) {
            if (isOpen()) setActive(hit);
            else choose(hit);
          }
        }
      });
      document.addEventListener("pointerdown", (e) => { if (!wrap.contains(e.target)) close(); });
      if (label) label.addEventListener("click", (e) => { e.preventDefault(); btn.focus(); });
      native.addEventListener("change", sync);
      native.classList.remove("form-field");
      native.classList.add("fm-select-native");
      native.tabIndex = -1;
      native.setAttribute("aria-hidden", "true");
      native.parentNode.insertBefore(wrap, native);
      wrap.append(btn, list, native);
      sync();
    });

    // live "characters left" counter under the requirements box (limit = maxlength, mirrored server-side)
    const detailsBox = document.getElementById("details");
    const detailsCount = document.getElementById("details-count");
    if (detailsBox && detailsCount) {
      const limit = Number(detailsBox.getAttribute("maxlength")) || 2000;
      const updateCount = () => {
        const left = Math.max(0, limit - detailsBox.value.length);
        detailsCount.textContent = left + (left === 1 ? " character left" : " characters left");
        detailsCount.classList.toggle("text-red-400", left <= 100);
        detailsCount.classList.toggle("text-text-dark", left > 100);
      };
      detailsBox.addEventListener("input", updateCount);
      updateCount();
    }

    // --- newsletter opt-in popup (FM-108) ------------------------------------------------
    // Opens once per visitor per 30 days: after 25 s on the page or once 40% has been scrolled,
    // whichever comes first. Closing it (button, Escape, click outside) or subscribing silences it.
    // Anything with data-optin-open reopens it on request. Without <dialog> support nothing happens.
    const optin = document.getElementById("optin");
    if (optin && typeof optin.showModal === "function") {
      const KEY = "fm-optin";
      const MUTE_MS = 30 * 24 * 3600 * 1000;
      const muted = () => {
        try {
          const t = Number(localStorage.getItem(KEY));
          return t > 0 && Date.now() - t < MUTE_MS;
        } catch {
          return false;
        }
      };
      // remembering the dismissal is Functional storage: only with consent (consent.js, FM-705)
      const allowed = () => !!(window.fmConsent && window.fmConsent.has("functional"));
      const mute = () => {
        if (!allowed()) return;
        try {
          localStorage.setItem(KEY, String(Date.now()));
        } catch {}
      };
      const page = optin.querySelector('input[name="page"]');
      if (page) page.value = window.location.pathname;
      const wired = wireForm({
        form: "optin-form",
        status: "optin-status",
        captcha: "optin-captcha",
        redirect: "/subscription.html#pending",
        lazy: true,
        onSuccess: mute,
      });
      const open = () => {
        if (optin.open) return;
        optin.showModal();
        if (wired) wired.loadCaptcha();
        const first = optin.querySelector("input[type=email]");
        if (first) first.focus();
      };
      const auto = () => {
        if (optin.open) return;
        if (!window.fmConsent || !window.fmConsent.get()) return void setTimeout(auto, 8000); // not before the consent choice
        if (!allowed() || muted()) return;
        const busy = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
        const menuOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
        if (busy || menuOpen) return void setTimeout(auto, 8000); // not while they are typing or navigating
        open();
      };
      const timer = setTimeout(auto, 25000);
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && window.scrollY / max > 0.4) {
          window.removeEventListener("scroll", onScroll);
          clearTimeout(timer);
          auto();
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      optin.addEventListener("close", mute);
      optin.addEventListener("click", (e) => {
        if (e.target === optin) optin.close(); // click on the backdrop
      });
      optin.querySelectorAll("[data-optin-close]").forEach((b) => b.addEventListener("click", () => optin.close()));
      document.querySelectorAll("[data-optin-open]").forEach((b) => b.addEventListener("click", open));
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
