# FluxMigrate — fluxmigrate.com

Marketing website for FluxMigrate: cloud infrastructure, DevOps, platform engineering and
SRE services, delivered either as projects or as embedded engineering capacity.

- **Live site:** https://www.fluxmigrate.com
- **Repository:** https://github.com/abilalmdo/fluxmigrate
- **Stack:** hand-written static HTML, one shared stylesheet, two small inline scripts. No framework.
- **Hosting/deploy:** FTP upload to shared hosting, driven by GitHub Actions on every push to `main`.

Open work is tracked in [`../TASKS.md`](../TASKS.md). This file explains how the site is put
together; it does not duplicate the task list.

---

## Repository layout

```
fluxmigrate/
├── .github/workflows/deploy.yml   FTP deploy on push to main
├── assets/
│   ├── site.css                   the entire design system, shared by every page
│   ├── favicon.svg, favicon*.png, favicon.ico, apple-touch-icon.png
│   ├── logo.png, logo-icon.png, logo-lockup.png, og-image.png
│   └── brand/                     vector brand system
│       ├── *.svg                  marks, lockups, favicon, app tile, Open Graph card
│       ├── png/                   generated PNG/ICO exports
│       ├── preview/               contact sheets and page screenshots for review
│       └── BRAND-GUIDELINES.md
├── tools/                         generators — see "Regenerating things"
├── index.html                     home
├── cloud-migration.html           service page
├── devops-platform-engineering.html
├── sre-reliability-engineering.html
├── vmware-modernization.html
├── staff-augmentation.html
├── technology.html
├── industries.html                tabbed industry content
├── about.html
├── contact.html                   form posts to formsubmit.co
├── 404.html
├── robots.txt, sitemap.xml, site.webmanifest
├── Dockerfile, nginx.conf, docker-compose.yml, .dockerignore
└── README.md
```

Eleven pages. Every page links `assets/site.css`; none carries an inlined `<style>` block.
The nav and footer markup is still repeated per page — see FM-404 in the task register.

---

## Local development

Quickest loop — serve the folder:

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```

That serves files, but not the way production does. To check caching, gzip, the custom 404
and extensionless URLs, run the container instead.

### Running it in Docker

```bash
docker compose up -d --build      # or: docker build -t fluxmigrate:local .
# http://localhost:8088
docker compose down
```

On Windows the daemon lives in WSL, so drive it from there:

```bash
wsl -e bash -lc "cd /mnt/d/FluxMigrate/fluxmigrate && docker compose up -d --build"
```

`nginx.conf` serves the site with gzip, cache headers (30 days for images, 7 for CSS/JS,
revalidate for HTML), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and
`Permissions-Policy`, the custom 404, and `try_files $uri $uri.html` so `/cloud-migration`
and `/cloud-migration.html` both resolve. `tools/` and `assets/brand/preview/` return 404.
The image excludes them entirely.

Production is FTP to shared hosting, not this container, so the two only agree if the host
is configured to match — see FM-305 in the task register.

Edit HTML directly for content. **For anything structural — nav, head, JSON-LD, landmarks —
edit `tools/patch_pages.py` and re-run it** rather than editing eleven files by hand. The
script is idempotent.

## Deployment

`.github/workflows/deploy.yml` runs `SamKirkland/FTP-Deploy-Action` on push to `main` and on
manual dispatch. Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. The workflow excludes
`.git*`, `.github`, `tools`, `node_modules`, the brand preview folder and all Markdown, so
only the site itself is uploaded.

---

## Design system

The visual language is a dark engineering console: near-black ground, an aurora field and a
faint 64 px grid behind the content, hairline borders instead of shadows, one azure-to-violet
gradient used sparingly, and monospace eyebrow labels that give the pages a technical register.

Everything lives in `assets/site.css`, organised in sixteen numbered sections. All values come
from custom properties on `:root`; no colour, space or radius is hard-coded further down.

### Colour

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#05080F` | page ground |
| `--surface` / `--surface-2` / `--surface-3` | `#0C1220` / `#101830` / `#16203C` | panels, fields, hover |
| `--line` / `--line-2` / `--line-3` | `rgba(140,162,204,.12 / .22 / .34)` | hairlines at three weights |
| `--text` / `--text-2` / `--text-3` | `#E9EEF9` / `#9AA7C4` / `#66728F` | heading, body, label |
| `--azure` / `--azure-200` | `#2D8FF5` / `#6FB4FF` | primary accent, links |
| `--violet` / `--violet-200` | `#7C5CFC` / `#A98BFF` | gradient end, secondary |
| `--teal` | `#2DD4BF` | positive signal, tags |
| `--amber` | `#F5A524` | incident marker in the SRE diagram |

`--grad` is the only gradient in normal use. It appears on the logo, the primary button, the
active nav underline, list bullets, the card hover ring and the eyebrow rule — and nowhere
across large areas.

### Typography

- **Inter Tight** 500/600/700 — headings, brand wordmark, drawer links.
- **Inter** 400/500/600 — body copy, buttons, form fields.
- **JetBrains Mono** 500 — eyebrows, lifecycle headings, table headers, footer column titles,
  step numbers. Uppercase, `.14–.16em` tracking.

Inter Tight was chosen because the logo wordmark is set in Inter Display SemiBold; the two
agree at a glance. Headings use `clamp()` and tight tracking (`-0.032em` to `-0.038em`).

### Layout primitives

`.wrap` (1200 px, fluid gutter) · `section` / `section.tight` · `.section-head` · `.kicker` ·
`.grid.cols-2/3/4` · `.card` · `.lifecycle` · `.sequence` + `.seq-step` · `.tabs` +
`.tab-panel` · `.cta-band` · `.paths` + `.path-card` · `.table-scroll` · `.notice` ·
`.hp-field` (honeypot) · `.skip-link` · `.nav-toggle` + `.nav-drawer`.

Breakpoints: 1000 px (hero stacks, grids go 2-up, header collapses into the drawer) and
640 px (everything single column).

### Signature details

- The logo's slanted bar is reused as the eyebrow rule and as the list bullet, so the brand
  mark echoes through the page without repeating the logo.
- Card borders are a masked gradient ring that fades in on hover, which keeps the resting
  state flat and the hover state branded.
- Nav links and tabs share one underline animation that grows from the left.
- Four hero diagrams — migration corridor, delivery pipeline, reliability band, engineer mesh
  — are assigned by page subject so no two page types open the same way.

---

## Brand assets

`assets/brand/` holds the vector brand system. The mark is four slanted bars stepping to the
right, the leading one detached — an implied **F** and a picture of workloads in migration.
Rules, clear space, minimum sizes and the rejected concepts are in
[`assets/brand/BRAND-GUIDELINES.md`](assets/brand/BRAND-GUIDELINES.md).

---

## Regenerating things

Three generators live in `tools/`. All are idempotent and all are run from the repository root.

| Script | What it rewrites |
| --- | --- |
| `tools/patch_pages.py` | head block, icons, fonts, canonical, JSON-LD, skip link, `<main>`, nav and drawer, footer brand, card icons — across all ten content pages |
| `tools/hero_visuals.py` | the hero diagram on each page, picked by subject |
| `tools/genbrand.py` + `tools/export.js` | the SVG brand sources and every PNG/ICO export |

```bash
python tools/patch_pages.py
python tools/hero_visuals.py

# brand pipeline (only when the mark itself changes)
cd tools
npm install                 # @resvg/resvg-js + sharp
pip install fonttools
# place Inter OTFs under tools/inter/extras/otf/  (github.com/rsms/inter releases)
python genbrand.py          # writes assets/brand/*.svg
node export.js              # writes assets/brand/png/*
```

`genbrand.py` reads glyph outlines from the Inter OTF files and emits the wordmark as real
vector paths, so the SVG logos do not depend on a font being installed anywhere.

### Screenshot check

`assets/brand/preview/` holds reference screenshots. To refresh them, drive the pages with
Puppeteer at 1440 px and at 390 px and confirm `document.documentElement.scrollWidth` never
exceeds `clientWidth` — horizontal overflow is the failure this catches.
