/**
 * Copy for the cookie and storage consent banner (ConsentBanner.astro) and /cookie-policy.html.
 * Keep it factual: the site sets no cookies and loads no analytics or advertising tools today (FM-705).
 * If a tool is added, list it in `inventory`, set its category here and load it only after
 * `window.fmConsent.has("<category>")`.
 */

export type ConsentCategory = {
  key: "necessary" | "functional" | "analytics" | "marketing";
  label: string;
  text: string;
  locked?: boolean;
  inUse: boolean;
};

export const consent = {
  title: "Your privacy choices",
  text: "We store a small amount of data in your browser to remember your choices and keep this site working. We do not run analytics or advertising tools today. If we add them, they will stay off unless you agree.",
  accept: "Accept all",
  reject: "Reject non-essential",
  customize: "Customize",
  policyLabel: "Cookie Policy",
  prefsTitle: "Cookie and storage settings",
  prefsIntro: "Choose what this site may store in your browser. You can change this at any time from the footer.",
  save: "Save choices",
  close: "Close",
  categories: [
    { key: "necessary", label: "Strictly necessary", text: "Remembers your choices on this page and keeps navigation and forms working. Always on.", locked: true, inUse: true },
    { key: "functional", label: "Functional", text: "Remembers that you closed the newsletter prompt so it does not return for 30 days.", inUse: true },
    { key: "analytics", label: "Analytics", text: "Would help us understand which pages are useful. Not in use today.", inUse: false },
    { key: "marketing", label: "Marketing", text: "Would be used for advertising and retargeting. Not in use today.", inUse: false },
  ] as ConsentCategory[],
};

export const cookiePolicy = {
  slug: "cookie-policy",
  title: "Cookie Policy | FluxMigrate",
  description:
    "What fluxmigrate.com stores in your browser, why, and how to change your choices. The site sets no cookies and runs no analytics or advertising tools today.",
  h1: "Cookie and **storage policy**",
  subtitle: "What this website stores in your browser, why, and how to change your choices.",
  updated: "3 October 2026",
  summaryTitle: "In short",
  summary: [
    "fluxmigrate.com sets no cookies.",
    "We store two small items in your browser's local storage: your consent choice and, if you allow it, a note that you closed the newsletter prompt.",
    "We do not run analytics, advertising or tracking tools, and we do not load scripts, fonts or images from other companies.",
  ],
  inventoryTitle: "What is stored today",
  inventoryIntro: "These items stay on your device. We do not read them on our servers.",
  inventoryHead: ["Name", "Where", "Category", "Purpose", "Kept for"],
  inventory: [
    ["fm-consent", "Local storage", "Strictly necessary", "Remembers your choices on this banner so we do not ask on every page.", "12 months, then we ask again"],
    ["fm-optin", "Local storage", "Functional", "Remembers that you closed the newsletter prompt so it does not return.", "30 days. Only stored if you allow Functional."],
  ],
  formsTitle: "Forms and your data",
  forms:
    "When you send the contact form or subscribe to emails, we receive the details you type in. To limit spam, our server also keeps a short-lived record of your IP address for rate limiting. This is not stored on your device. How we use form data is set out in our Privacy Policy.",
  thirdTitle: "Other companies",
  third:
    "This site loads no third-party scripts, trackers, fonts or embedded content. If that changes, we will list each one above and keep it off until you agree.",
  changeTitle: "Change your choices",
  change:
    "You can open the settings at any time. You can also clear this site's data in your browser settings, and we will ask again on your next visit.",
  changeButton: "Open cookie settings",
  contactTitle: "Questions",
  contact: "Write to us at",
};
