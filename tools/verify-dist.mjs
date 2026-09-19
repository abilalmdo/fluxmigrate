// Verifies the built site in dist/ — run after `pnpm build`:  node tools/verify-dist.mjs
// Exits non-zero on any failure, so it can gate a deploy in CI.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist");
const SITE = "https://www.fluxmigrate.com";
const EXPECTED = [
  "index", "about", "contact", "technology", "industries", "cloud-migration",
  "devops-platform-engineering", "sre-reliability-engineering", "vmware-modernization", "staff-augmentation",
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

for (const [file, src] of Object.entries(html)) {
  const slug = file.replace(/\.html$/, "");
  const is404 = slug === "404";

  const title = src.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(file, "no <title>");
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!desc) fail(file, "no meta description");

  const canon = src.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (is404) {
    if (canon) fail(file, "404 must not have a canonical");
    if (!/name="robots" content="noindex/.test(src)) fail(file, "404 must be noindex");
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
  if (!is404 && blocks.length < 2) fail(file, `${blocks.length} JSON-LD blocks`);
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
}

// sitemap
const sm = existsSync(join(dist, "sitemap-0.xml")) ? readFileSync(join(dist, "sitemap-0.xml"), "utf8") : "";
for (const slug of EXPECTED) {
  // the site root is the same URL with or without its trailing slash
  const wants = slug === "index" ? [`<loc>${SITE}/</loc>`, `<loc>${SITE}</loc>`] : [`<loc>${SITE}/${slug}.html</loc>`];
  if (!wants.some((w) => sm.includes(w))) fail("sitemap", `missing ${wants[0]}`);
}
if (sm.includes("/404")) fail("sitemap", "404 must not be listed");
if (!existsSync(join(dist, "robots.txt"))) fail("robots", "robots.txt missing");

if (failures === 0) pass(`${files.length} pages verified: SEO tags, JSON-LD, images, links/anchors, no third-party loads, sitemap`);
else console.log(`\n${failures} problem(s)`);
process.exit(failures ? 1 : 0);
