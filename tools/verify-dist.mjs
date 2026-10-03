// Verifies the built site in dist/ — run after `pnpm build`:  node tools/verify-dist.mjs
// Exits non-zero on any failure, so it can gate a deploy in CI.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist");
const cfg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "src", "config", "config.json"), "utf8")).params;
const PHONE_TEL = cfg.phone.tel;
const OFFICE_LABELS = cfg.offices.map((o) => o.label);
const ADDRESS_PAGES = new Set(["contact.html", "contact-us.html"]);
const SITE = "https://www.fluxmigrate.com";
const EXPECTED = [
  "index", "about", "contact", "contact-us", "technology", "industries", "cloud-migration",
  "devops-platform-engineering", "sre-reliability-engineering", "vmware-modernization", "staff-augmentation",
  "aiops-services", "aiops-sre", "aiops-security", "aiops-grc", "aiops-network", "aiops-cloud", "aiops-finops",
  "aiops-devsecops", "aiops-mlops", "cookie-policy", "privacy-policy", "terms-of-service",
];

let failures = 0;
const fail = (page, msg) => { failures++; console.log(`FAIL  ${page}: ${msg}`); };
const pass = (msg) => console.log(`PASS  ${msg}`);

const files = readdirSync(dist).filter((f) => f.endsWith(".html"));
const ids = {};
const html = {};
for (const f of files) {
  html[f] = readFileSync(join(dist, f), "utf8");
  ids[f] = new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

for (const slug of EXPECTED) if (!html[`${slug}.html`]) fail(slug, "page missing from dist");
if (!html["404.html"]) fail("404", "404.html missing");
if (!html["thank-you.html"]) fail("thank-you", "thank-you.html missing");
if (!html["subscription.html"]) fail("subscription", "subscription.html missing");

for (const [file, src] of Object.entries(html)) {
  const slug = file.replace(/\.html$/, "");
  const is404 = slug === "404";
  const noindex = is404 || slug === "thank-you" || slug === "subscription"; // utility pages: noindex, no canonical, not in the sitemap

  const title = src.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(file, "no <title>");
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!desc) fail(file, "no meta description");

  const canon = src.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (noindex) {
    if (canon) fail(file, "must not have a canonical");
    if (!/name="robots" content="noindex/.test(src)) fail(file, "must be noindex");
  } else {
    const want = slug === "index" ? `${SITE}/` : `${SITE}/${slug}.html`;
    if (canon !== want) fail(file, `canonical ${canon} != ${want}`);
    if (!new RegExp(`property="og:url" content="${want.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(src)) fail(file, "og:url does not match canonical");
  }

  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(file, `${h1} <h1> elements`);
  if (!/<main id="main-content"/.test(src)) fail(file, "no <main id=main-content>");
  if (!/class="skip-link"/.test(src)) fail(file, "no skip link");

  // JSON-LD
  const blocks = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!noindex && blocks.length < 2) fail(file, `${blocks.length} JSON-LD blocks`);
  for (const b of blocks) { try { JSON.parse(b); } catch { fail(file, "invalid JSON-LD"); } }

  // images
  for (const tag of src.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt="/.test(tag)) fail(file, `img without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) fail(file, `img without width/height: ${tag.slice(0, 80)}`);
    const s = tag.match(/\ssrc="([^"]+)"/)?.[1];
    if (s && s.startsWith("/") && !existsSync(join(dist, s.split("?")[0]))) fail(file, `missing image ${s}`);
  }

  // internal links and anchors
  for (const m of src.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1];
    if (href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("http")) continue;
    if (!href.startsWith("/")) continue;
    const [pathPart, hash] = href.split("#");
    if (/^\/(_astro|images|brand|favicon|apple-touch|site\.webmanifest|sitemap)/.test(pathPart)) {
      if (!existsSync(join(dist, pathPart))) fail(file, `broken asset link ${href}`);
      continue;
    }
    const target = pathPart === "/" || pathPart === "" ? "index.html" : pathPart.replace(/^\//, "");
    const tf = target.endsWith(".html") ? target : `${target}.html`;
    if (!html[tf]) { fail(file, `link to missing page ${href}`); continue; }
    if (hash && !ids[tf].has(hash)) fail(file, `anchor #${hash} not found in ${tf}`);
  }

  // nothing may load from a third-party host
  for (const m of src.matchAll(/<(?:script|link|img|iframe)\b[^>]*?\s(?:src|href)="(https?:\/\/[^"]+)"/g)) {
    if (/rel="canonical"/.test(m[0])) continue;
    fail(file, `third-party load: ${m[1]}`);
  }
  if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr|unpkg\.com|cdnjs/.test(src)) fail(file, "references a font/script CDN");
  // the phone number must be a tap-to-call link on every page, in the footer, matching config.json
  if (!src.includes(`href="tel:${PHONE_TEL}"`)) fail(file, `no tap-to-call link for ${PHONE_TEL}`);
  // the addresses live on the contact pages only, not in the footer of every page
  for (const label of OFFICE_LABELS) {
    const has = src.replace(/<script[\s\S]*?<\/script>/g, "").includes(label); // visible text only; JSON-LD names the offices on the home page
    if (ADDRESS_PAGES.has(file) && !has) fail(file, `office "${label}" missing`);
    if (!ADDRESS_PAGES.has(file) && has) fail(file, `office "${label}" must not appear on this page`);
  }
  // footer link columns stay short and even: at most five links each
  for (const ul of (src.match(/<footer[\s\S]*?<\/footer>/) || [""])[0].match(/<ul[\s\S]*?<\/ul>/g) || []) {
    const n = (ul.match(/<li[\s>]/g) || []).length;
    if (n > 5) fail(file, `a footer column has ${n} links (max 5)`);
  }
  // no form may post to another site (the contact form uses our own /contact-submit.php)
  for (const m of src.matchAll(/<form\b[^>]*\saction="([^"]*)"/g)) {
    if (m[1] !== "/contact-submit.php" && m[1] !== "/subscribe.php") fail(file, `form posts to ${m[1]}`);
  }
}

// contact form back end (task FM-106): the endpoint, its library and the rules that protect the config
for (const f of ["contact-submit.php", "contact-captcha.php", "subscribe.php", "subscribe-confirm.php", "subscribe-unsubscribe.php", "_form/guard.php", "_form/mailer.php", "_form/email-template.php", "brand/email-logo.png", "_form/subscribers.php", "_form/.htaccess", "_form/phpmailer/PHPMailer.php", "_form/phpmailer/SMTP.php", "_form/phpmailer/Exception.php"]) {
  if (!existsSync(join(dist, f))) fail("contact-form", `${f} missing from dist`);
}
for (const needle of ['id="captcha-field"', 'name="captcha_token"', 'name="captcha"', 'name="hp_url"']) {
  if (!(html["contact.html"] || "").includes(needle)) fail("contact.html", `form lacks ${needle} (spam protection, FM-107)`);
}
if (!/action="\/contact-submit\.php"/.test(html["contact.html"] || "")) fail("contact.html", "form does not post to /contact-submit.php");
// newsletter opt-in (task FM-108): the popup is on every indexable page except the contact page, and its
// consent wording matches what the server stores
{
  const consentPhp = readFileSync(join(dist, "subscribe.php"), "utf8") && readFileSync(join(dist, "_form/subscribers.php"), "utf8").match(/FM_CONSENT_TEXT = '([^']*)'/)?.[1];
  for (const [file, src] of Object.entries(html)) {
    const slug = file.replace(/\.html$/, "");
    const utility = ["404", "thank-you", "subscription", "contact"].includes(slug);
    const has = /<dialog id="optin"/.test(src);
    if (utility && has) fail(file, "must not carry the newsletter popup");
    if (!utility && !has) fail(file, "newsletter popup missing");
    if (has) {
      for (const needle of ['action="/subscribe.php"', 'name="consent"', 'name="hp_url"', 'name="captcha_token"', 'id="optin-captcha-field"']) {
        if (!src.includes(needle)) fail(file, `popup lacks ${needle}`);
      }
      if (!consentPhp || !src.includes(consentPhp.replace(/&/g, "&amp;"))) fail(file, "popup consent wording differs from FM_CONSENT_TEXT in _form/subscribers.php");
    }
  }
}
const ht = existsSync(join(dist, ".htaccess")) ? readFileSync(join(dist, ".htaccess"), "utf8") : "";
if (!/FilesMatch[^\n]*mail-config\\\.php/.test(ht)) fail(".htaccess", "does not deny mail-config.php");
// structured data must carry the same phone and offices the page prints
{
  const org = [...(html["index.html"] || "").matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1])).find((o) => o["@type"] === "Organization");
  if (!org) fail("index", "no Organization JSON-LD");
  else {
    if (org.telephone !== PHONE_TEL) fail("index", `Organization.telephone ${org.telephone} != ${PHONE_TEL}`);
    if ((org.address || []).length !== cfg.offices.length) fail("index", "Organization.address does not list every office");
  }
}

// sitemap
const sm = existsSync(join(dist, "sitemap-0.xml")) ? readFileSync(join(dist, "sitemap-0.xml"), "utf8") : "";
for (const slug of EXPECTED) {
  // the site root is the same URL with or without its trailing slash
  const wants = slug === "index" ? [`<loc>${SITE}/</loc>`, `<loc>${SITE}</loc>`] : [`<loc>${SITE}/${slug}.html</loc>`];
  if (!wants.some((w) => sm.includes(w))) fail("sitemap", `missing ${wants[0]}`);
}
if (sm.includes("/404")) fail("sitemap", "404 must not be listed");
if (sm.includes("/thank-you")) fail("sitemap", "thank-you must not be listed");
if (sm.includes("/subscription")) fail("sitemap", "subscription must not be listed");
if (!existsSync(join(dist, "robots.txt"))) fail("robots", "robots.txt missing");

if (failures === 0) pass(`${files.length} pages verified: SEO tags, JSON-LD, images, links/anchors, no third-party loads, sitemap`);
else console.log(`\n${failures} problem(s)`);
process.exit(failures ? 1 : 0);
