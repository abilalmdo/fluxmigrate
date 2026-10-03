/* Consent for cookies and browser storage (FM-705).
 * Stores the visitor's choice in localStorage ("fm-consent"). The site sets no cookies and loads no
 * analytics today; anything optional must check window.fmConsent.has("<category>") before it runs.
 *   window.fmConsent.get()      -> {v, ts, functional, analytics, marketing} or null (not decided yet)
 *   window.fmConsent.has(cat)   -> boolean; "necessary" is always true
 *   window.fmConsent.open()     -> opens the settings dialog
 * A "fm:consent" event is dispatched on window after every change. */
(function () {
  "use strict";

  const KEY = "fm-consent";
  const VERSION = 1;
  const MAX_AGE_MS = 365 * 24 * 3600 * 1000;
  const OPTIONAL = ["functional", "analytics", "marketing"];

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (!v || v.v !== VERSION || !(Date.now() - v.ts < MAX_AGE_MS)) return null;
      return v;
    } catch {
      return null;
    }
  }

  let current = read();

  function write(choice) {
    current = { v: VERSION, ts: Date.now() };
    OPTIONAL.forEach((k) => (current[k] = !!choice[k]));
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
      // withdrawing Functional removes what it stored
      if (!current.functional) localStorage.removeItem("fm-optin");
    } catch {}
    window.dispatchEvent(new CustomEvent("fm:consent", { detail: current }));
  }

  window.fmConsent = {
    get: () => current,
    has: (cat) => cat === "necessary" || !!(current && current[cat]),
    open: () => openPrefs(),
  };

  let banner, prefs, form;

  function syncForm() {
    OPTIONAL.forEach((k) => {
      const input = form.elements[k];
      if (input) input.checked = !!(current && current[k]);
    });
  }

  function openPrefs() {
    if (!prefs || typeof prefs.showModal !== "function") return;
    syncForm();
    if (!prefs.open) prefs.showModal();
    const first = form.querySelector("input:not(:disabled)");
    if (first) first.focus();
  }

  function decide(choice) {
    write(choice);
    if (banner) banner.hidden = true;
    if (prefs && prefs.open) prefs.close();
  }

  const ALL = { functional: true, analytics: true, marketing: true };
  const NONE = { functional: false, analytics: false, marketing: false };

  function init() {
    banner = document.getElementById("consent-banner");
    prefs = document.getElementById("consent-prefs");
    form = document.getElementById("consent-form");
    if (!banner || !prefs || !form) return;

    document.querySelectorAll("[data-consent]").forEach((el) => {
      el.addEventListener("click", () => {
        const a = el.getAttribute("data-consent");
        if (a === "accept") decide(ALL);
        else if (a === "reject") decide(NONE);
        else if (a === "customize") openPrefs();
        else if (a === "close") prefs.close();
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const choice = {};
      OPTIONAL.forEach((k) => (choice[k] = form.elements[k].checked));
      decide(choice);
    });

    prefs.addEventListener("click", (e) => {
      if (e.target === prefs) prefs.close(); // click on the backdrop
    });

    // anything that asks to reopen the settings: [data-consent-open], or the footer's cookie-settings link
    document.querySelectorAll('[data-consent-open], a[href="/cookie-policy.html#settings"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        if (typeof prefs.showModal !== "function") return;
        e.preventDefault();
        openPrefs();
      });
    });

    if (!current) banner.hidden = false;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
