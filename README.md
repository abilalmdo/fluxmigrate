# FluxMigrate — fluxmigrate.com

Marketing website for FluxMigrate: cloud infrastructure, DevOps, platform engineering and SRE
services, delivered either as projects or as embedded engineering capacity.

- **Live site:** https://www.fluxmigrate.com
- **Repository:** https://github.com/abilalmdo/fluxmigrate
- **Stack:** [Astro](https://astro.build) 7 (static output) + Tailwind CSS 4, on the **Automark** theme
  by Themefisher (MIT). No server code: the build produces plain files.
- **Hosting/deploy:** FTP to shared hosting, driven by GitHub Actions on every push to `main`
  (build → verify → sync `dist/`).

Open work is tracked in [`../TASKS.md`](../TASKS.md). This file explains how the site is put
together; it does not duplicate the task list.

---

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:4321 — hot reload
pnpm build          # → dist/   (static files, ready to upload)
node tools/verify-dist.mjs   # SEO tags, JSON-LD, alt text, links/anchors, no third-party loads
```

Node 22.12+ and pnpm (pinned via `packageManager`). `pnpm build` downloads the two Google fonts
once and bakes them into `dist/` — nothing is fetched from Google or any CDN at runtime.

### Preview as a real web server (Docker)

```bash
docker compose up -d --build     # multi-stage: builds the site, serves dist/ with nginx
# http://localhost:8088
```

On Windows the daemon lives in WSL: `wsl -e bash -lc "cd /mnt/d/FluxMigrate/fluxmigrate && docker compose up -d --build"`.
WSL2 shuts itself down after ~60–90 s with no shell attached, which stops the container; keep a
session open (or a hidden `wsl.exe -e sleep infinity`) while reviewing.

`nginx.conf` mirrors the production `.htaccess`: gzip, fingerprinted `/_astro/*` cached for a
year, images for a month, HTML revalidated, the custom 404, security headers, and
`try_files $uri $uri.html` so extensionless URLs resolve.

---

## Repository layout

```
fluxmigrate/
├── src/
│   ├── data/content.ts          ALL page copy (home + 8 content pages + contact + 404)
│   ├── config/
│   │   ├── config.json          site title, URL, logo, contact form target, footer text, CTA button
│   │   ├── menu.json            header nav (flat row + Services dropdown) and footer columns
│   │   └── theme.json           colours and fonts → generates src/styles/generated-theme.css
│   ├── pages/                   index, [slug] (the 8 content pages), contact, 404
│   ├── layouts/
│   │   ├── Base.astro           <head>, SEO, JSON-LD slots, skip link, scripts
│   │   ├── partials/            Header (accessible menu + dropdown), Footer
│   │   └── components/          PageHero, HeroImage, HeroDecor, Blocks, Tabs, CtaBand, PathCards, …
│   ├── lib/site.ts              canonical URLs and schema.org builders
│   ├── scripts/                 main.js (menu, tabs, form banner), animations.js, particleCanvas.js
│   └── styles/                  Tailwind entry + theme CSS + FluxMigrate components
├── public/
│   ├── images/{icons,heroes}/   generated illustrations (see "Images")
│   ├── images/og-image.png      social card
│   ├── brand/                   the three logo SVGs the site loads
│   ├── favicon*, apple-touch-icon.png, site.webmanifest, robots.txt, .htaccess
├── tools/
│   ├── images/                  original icon + illustration generator (SVG → WebP/PNG)
│   ├── brand/                   logo SVG generator + exports (Python + Node)
│   └── verify-dist.mjs          post-build verifier, also run in CI
├── docs/brand/                  brand guidelines, logo sources/exports, review screenshots
├── Dockerfile, nginx.conf, docker-compose.yml
├── .github/workflows/deploy.yml
├── LICENSE-THEME-AUTOMARK, THIRD-PARTY-NOTICES.md
└── astro.config.mjs, package.json, tsconfig.json
```

### URLs are preserved

The site was static HTML with `.html` URLs, and search engines have indexed them. Astro is
configured with `build.format: "file"`, so every page keeps its address:

`/`, `/about.html`, `/contact.html`, `/technology.html`, `/industries.html`,
`/cloud-migration.html`, `/devops-platform-engineering.html`,
`/sre-reliability-engineering.html`, `/vmware-modernization.html`, `/staff-augmentation.html`,
`/404.html`. Canonicals, `og:url`, the sitemap and every internal link use that `.html` form.

---

## Editing content

| To change… | Edit |
| --- | --- |
| Copy on any page, service cards, tabs, CTAs, meta title/description | `src/data/content.ts` |
| Header nav, Services dropdown, footer columns | `src/config/menu.json` |
| Site title, URL, footer tagline, email, contact-form target | `src/config/config.json` |
| Colours, fonts | `src/config/theme.json` (then `pnpm dev`/`build` regenerates the CSS) |
| Page structure or a component | `src/pages/*` and `src/layouts/*` |

`**bold**` inside a title renders in the theme's accent colour. Icon names refer to files in
`public/images/icons/`. A content page is a list of *blocks* (`cards`, `groups`, `steps`,
`chips`, `tabs`); add one to a page's `blocks` array and `Blocks.astro` renders it.

### Services taxonomy

Nav has two layers and neither replaces the other:

- **Flat row** (`menu.json` → `main`): Staff Augmentation, DevOps, SRE, VMware, Technology,
  Industries, About — as on the original site.
- **Services dropdown** (`menu.json` → `main[0].children`, mirrored in the footer): FluxMigrate's
  five service pages under their own names, plus four categories with no page of their own yet
  (DevSecOps, Kubernetes Services, FinOps Consulting, Well-Architected Review) that anchor into
  the nine-card Services section on the home page (`/#service-…`).

If you rename an existing service, match its own page's `<h1>`, not another company's wording
for a similar thing.

---

## Images

Everything in `public/images/` is original artwork generated by code — the Automark theme's own
images are licensed for demonstration only and are **not** shipped.

```bash
pnpm images                       # icons + 10 hero illustrations + OG card
node tools/images/build.mjs icons
node tools/images/build.mjs heroes sre-reliability    # one scene
```

- **Icons** (`tools/images/glyphs.mjs`, `icons.mjs`): 57 two-tone line icons on a violet tile,
  as SVG. A glyph is drawn once on a 24-unit grid; keys map to glyphs in `icons.mjs`.
- **Illustrations** (`tools/images/scenes/*.mjs`): ten 1600×900 scenes rendered to 2400 px WebP —
  a control-plane overview for the home page and one per content page. They are deliberately
  *illustrative*: no client names, logos, or numeric metrics, and each carries an
  "Illustrative view" caption. Vendor names appear as text only.
- **OG image** (`scenes/og.mjs`): 1200×630 PNG, built from the brand lockup and the overview scene.
- Text inside images is set in Inter (`tools/images/fonts/`, SIL OFL) through resvg, so no font
  needs installing on the machine that builds them.

Generated files are committed; CI does not need to run the generator.

### Brand assets

`tools/brand/genbrand.py` (needs `pip install fonttools`) writes every logo SVG to
`docs/brand/svg/` and copies the three the site uses to `public/brand/`;
`node tools/brand/export.mjs` writes PNG exports to `docs/brand/png/` and refreshes the favicons in
`public/`. Rules and rejected concepts: [`docs/brand/BRAND-GUIDELINES.md`](docs/brand/BRAND-GUIDELINES.md).
`favicon.ico` (multi-size) is built once with Pillow from `docs/brand/png/favicon-512.png`.

---

## Design system

The look is the Automark theme: near-black `#03010E` ground, violet `#937AFF` / `#4D36D0`
accent, Urbanist headings and Inter Tight body, pill buttons, glowing hero with drifting
particles, a floating rounded nav bar, and a hero image that tilts flat as it scrolls into view.

Adaptations for FluxMigrate — kept deliberately, do not revert them:

- **Accessible navigation.** The theme's checkbox-hack menu could not be opened by keyboard.
  Mobile is a real `<button aria-expanded>`; the Services dropdown is a `<details>` (click,
  Enter/Space, Escape to close, click-outside to close). The header collapses below 1280 px
  because eight links do not fit a pill nav at 1024 px.
- **Reduced motion respected.** The theme's Lenis smooth-scroll (which hijacked scrolling and
  ignored `prefers-reduced-motion`) is removed. The hero tilt, header hide-on-scroll and
  particles are skipped when the visitor asks for reduced motion.
- **Particles fixed.** The theme created a 2000×2000 canvas per instance and repainted it every
  frame forever (and passed its size argument in the wrong position). Now: ≤800 px, animated only
  while on screen and the tab is visible, one still frame under reduced motion.
- **GSAP is bundled**, not loaded from a CDN.
- **Removed from the theme:** blog, pricing, careers, case studies, integrations, testimonials,
  partner logos, Stripe and API routes, the Vercel adapter, React/MDX. A B2B consultancy with no
  published clients should not display invented ones (task FM-701).

### Accessibility and quality gates

Zero axe-core violations (WCAG 2 A/AA + best practice) on all pages at 1440 px and 390 px;
verified after every significant change together with `tools/verify-dist.mjs`. Both should
pass before deploying.

---

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: install (`pnpm --frozen-lockfile`) →
`pnpm build` → `node tools/verify-dist.mjs` → `SamKirkland/FTP-Deploy-Action` syncing `dist/`.
Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. The action tracks what it uploaded, so
files that no longer exist (the old `assets/` folder and hand-written pages) are removed from the
host on the first run.

`public/.htaccess` (Apache/LiteSpeed) provides the 404 page, extensionless URLs, `/index.html`→`/`,
caching, gzip and security headers. The http→https and non-www→www redirects are written but
commented out until the host's TLS/CDN setup is confirmed — see FM-305.

## Licences

Automark © Themefisher, MIT — [`LICENSE-THEME-AUTOMARK`](LICENSE-THEME-AUTOMARK). Its images are
"demonstration purposes only" and are not used. Other components and fonts:
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
