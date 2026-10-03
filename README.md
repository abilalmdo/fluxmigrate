# FluxMigrate — fluxmigrate.com

Marketing website for FluxMigrate: cloud infrastructure, DevOps, platform engineering and SRE
services, delivered either as projects or as embedded engineering capacity.

- **Live site:** https://www.fluxmigrate.com
- **Repository:** https://github.com/abilalmdo/fluxmigrate
- **Stack:** [Astro](https://astro.build) 7 (static output) + Tailwind CSS 4, on the **Automark** theme
  by Themefisher (MIT). Pages are plain files; the only server code is the contact form's
  `contact-submit.php`.
- **Hosting/deploy:** FTP to shared hosting (Namecheap, LiteSpeed, PHP 8.x), driven by GitHub Actions
  on every push to `main` (build → verify → write mail config → sync `dist/` → check the form).

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

Node 22.19+ (`.nvmrc` says `22`, which CI resolves to the latest 22.x) and pnpm (pinned via `packageManager`;
pnpm 11.9 itself refuses to run below Node 22.13). `pnpm build` downloads the two Google fonts
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
│   │   ├── config.json          site title, URL, logo, contact form endpoint, footer text, CTA button
│   │   ├── menu.json            header nav (flat row + Services dropdown) and footer columns
│   │   └── theme.json           colours and fonts → generates src/styles/generated-theme.css
│   ├── pages/                   index, [slug] (the 8 content pages), contact, contact-us, thank-you, 404
│   ├── layouts/
│   │   ├── Base.astro           <head>, SEO, JSON-LD slots, skip link, scripts
│   │   ├── partials/            Header (accessible menu + dropdown), Footer
│   │   └── components/          PageHero, HeroImage, HeroDecor, Blocks, Tabs, CtaBand, PathCards, …
│   ├── lib/site.ts              canonical URLs and schema.org builders
│   ├── scripts/                 main.js (menu, tabs, contact form), animations.js, particleCanvas.js
│   └── styles/                  Tailwind entry + theme CSS + FluxMigrate components
├── public/
│   ├── images/{icons,heroes}/   generated illustrations (see "Images")
│   ├── images/og-image.png      social card
│   ├── brand/                   the horizontal logo and the mark (SVG) the site loads
│   ├── contact-submit.php       the contact form back end
│   ├── contact-captcha.php, subscribe*.php   captcha questions and the newsletter opt-in (FM-107, FM-108)
│   ├── _form/                   PHPMailer (LGPL) for the form; web access denied
│   ├── favicon*, apple-touch-icon.png, site.webmanifest, robots.txt, .htaccess
├── tools/
│   ├── images/                  original icon + illustration generator (SVG → WebP/PNG)
│   ├── brand/                   logo import + export scripts (Node); legacy-four-bar/ = retired generators
│   ├── form-test/               contact-form tests: real PHP in Docker + a fake SMTP server
│   ├── write-mail-config.mjs    CI step: writes dist/mail-config.php from GitHub secrets
│   └── verify-dist.mjs          post-build verifier, also run in CI
├── docs/brand/                  brand guidelines, logo sources (svg/) and exports (png/), legacy-four-bar/
├── Dockerfile, nginx.conf, docker-compose.yml
├── .github/workflows/deploy.yml
├── LICENSE-THEME-AUTOMARK, THIRD-PARTY-NOTICES.md
└── astro.config.mjs, package.json, tsconfig.json
```

### URLs are preserved

The site was static HTML with `.html` URLs, and search engines have indexed them. Astro is
configured with `build.format: "file"`, so every page keeps its address:

`/`, `/about.html`, `/contact.html`, `/technology.html`, `/industries.html`,
`/contact-us.html`, `/aiops-services.html`, `/cloud-migration.html`, `/devops-platform-engineering.html`,
`/sre-reliability-engineering.html`, `/vmware-modernization.html`, `/staff-augmentation.html`,
`/privacy-policy.html`, `/terms-of-service.html`, `/cookie-policy.html`, `/404.html`, `/thank-you.html`, `/subscription.html` (noindex, not in the sitemap). Canonicals, `og:url`, the sitemap and every internal link use that `.html` form.

---

## Editing content

| To change… | Edit |
| --- | --- |
| Copy on any page, service cards, tabs, CTAs, meta title/description | `src/data/content.ts` |
| Header nav, Services dropdown, footer columns | `src/config/menu.json` |
| Site title, URL, footer tagline, email, contact-form endpoint | `src/config/config.json` |
| Phone number, opening hours, office addresses | `params.phone`, `params.offices` in `src/config/config.json`. The phone shows in the footer, contact page, mobile menu and thank-you page; the addresses show on `/contact.html` and `/contact-us.html` only (not the footer); JSON-LD reads both |
| AIOps page and home AIOps section (tracks, services, scenarios) | `src/data/aiops.ts` (tracks, services) and `src/data/aiops-detail.ts` (per-service capabilities and scenarios, track pages); art in `tools/images/scenes/aiops.mjs` |
| "Contact Us" page wording | `contactUsPage` in `src/data/content.ts` (footer link: `menu.json` → `footer_company`) |
| Thank-you page wording | `thankYouPage` in `src/data/content.ts` |
| Privacy Policy and Terms of Service text | `src/data/legal.ts` (shared page `LegalPage.astro`); footer links in `menu.json` → `footer_legal`. Standard-form text: keep it true to the site and update the date when a tool that handles personal data is added |
| Who receives enquiries, SMTP host/user | GitHub secrets (see "Contact form"), not a file in the repo |
| Colours, fonts | `src/config/theme.json` (then `pnpm dev`/`build` regenerates the CSS) |
| Page structure or a component | `src/pages/*` and `src/layouts/*` |

`**bold**` inside a title renders in the theme's accent colour. Icon names refer to files in
`public/images/icons/`. A content page is a list of *blocks* (`cards`, `groups`, `steps`,
`chips`, `tabs`); add one to a page's `blocks` array and `Blocks.astro` renders it.

### Services taxonomy

Nav has two layers and neither replaces the other:

- **Flat row** (`menu.json` → `main`): Staff Augmentation, DevOps, SRE, VMware, Technology,
  Industries, About — as on the original site.
- **Services dropdown** (`menu.json` → `main[0].children`): FluxMigrate's
  five service pages under their own names, plus four categories with no page of their own yet
  (DevSecOps, Kubernetes Services, FinOps Consulting, Well-Architected Review) that anchor into
  the nine-card Services section on the home page (`/#service-…`).

The **footer** Services column is a separate, shorter list (`menu.json` → `footer_services`, five links at most; a footer column
never exceeds five, and `verify-dist` enforces it). Where the site already has a matching service the link goes to it, otherwise
to `/contact.html`. Changing it does not touch the header dropdown.

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
- **OG image** (`scenes/og.mjs`): 1200×630 PNG, built from the horizontal logo and the overview scene.
- Text inside images is set in Inter (`tools/images/fonts/`, SIL OFL) through resvg, so no font
  needs installing on the machine that builds them.

Generated files are committed; CI does not need to run the generator.

### Brand assets

The logo is the owner-supplied option A, purple + red (F + M + play triangle, bold wordmark with a red i dot), with
a dark-background and a light-background version. Sources live in `docs/brand/svg/`, exports in `docs/brand/png/`.

```bash
node tools/brand/import-logo.mjs "../Logo-Design/<delivered folder>"  # writes docs/brand/svg/*
node tools/brand/export.mjs                                          # PNG/ICO exports, refreshes public/
pnpm images                                                          # OG card + illustrations that draw the mark
```

Rules (which file on which background, header sizes, don'ts) and the retired four-bar mark:
[`docs/brand/BRAND-GUIDELINES.md`](docs/brand/BRAND-GUIDELINES.md).

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

## Contact form

The form posts to our own `public/contact-submit.php`; **no third party is involved and the visitor
never leaves fluxmigrate.com**. FormSubmit was dropped: its captcha page and its activation step were
the problem (FM-105, FM-106).

```
contact.html --fetch--> contact-submit.php --SMTP--> mailbox (forms@) --> info@fluxmigrate.com
     |  (no JS: plain POST)        |
     +<-- 303 /thank-you.html <----+      on error: message inline, typed text kept
```

- **Delivery:** PHPMailer (`public/_form/phpmailer/`, LGPL-2.1, see `THIRD-PARTY-NOTICES.md`) over
  authenticated SMTP. If SMTP fails (some shared hosts block outbound ports) it falls back to the host's
  own `mail()`, which SPF and DKIM already cover. `Reply-To` is the visitor, so replying answers them.
- **Abuse controls (FM-107):** layered, all in `public/contact-submit.php`, `contact-captcha.php` and `_form/guard.php`.
  1. **Self-hosted captcha.** The page asks `/contact-captcha.php` for a question ("What is 7 plus 5?", "Type the last three letters
     of the word ..."). The token is signed, the answer is never stored, a token works once and lives 30 minutes, and an answer
     faster than 3 s is treated as a script. Digits or words are both accepted. To add or change question types edit
     `fm_captcha_new()` and the `solve()` helper in `tools/form-test/check-endpoint.mjs`.
  2. **Honeypot** (`hp_url`), **minimum fill time** (`ts`, under 2.5 s), **same-site `Origin` check**, 64 KB body cap.
  3. **Strikes and lockout.** Honeypot, script-speed answers, wrong or reused captcha, foreign Origin, spam content and oversize
     bodies each count a strike; three in an hour lock the client out (HTTP 429) until the oldest strike ages away. Bots that trip the
     honeypot or the timer are told "success" and nothing is sent.
  4. **Content filter.** A link in a short field, more than two links in the message, HTML tags, or a few spam trades are refused
     with a visible message (so a false positive is not silent).
  5. **Duplicates.** The same email, name, company and message within 24 h is thanked but not sent twice.
  6. **Rate limits.** 5 enquiries per IP per hour, 60 overall, 30 captcha questions per IP per hour; length limits; CR/LF stripped
     from every header value. Counters live in the system temp dir (client IPs only as a keyed hash).
  No third-party script or service is involved. A JavaScript-off visitor cannot pass the captcha; the page tells them to email.
  The limits are per `REMOTE_ADDR`: if a CDN or proxy is ever put in front of the site, add trusted `X-Forwarded-For` handling
  in `fm_client_key()` or every visitor will share one counter.
- **Secrets:** the SMTP credentials exist only as **GitHub Actions secrets** `SMTP_HOST`, `SMTP_USER`,
  `SMTP_PASSWORD` (optional: `SMTP_PORT` = 465, `SMTP_SECURE` = `ssl` or `tls`, `MAIL_TO` =
  info@fluxmigrate.com, `MAIL_FROM` = `SMTP_USER`). On each deploy `tools/write-mail-config.mjs` writes
  `dist/mail-config.php` from them; nothing is committed. `public/.htaccess` refuses that file (and
  `error_log`, and the FTP action's sync-state file), and the deploy workflow requests the URL after every
  deploy and fails if it is served. Set a secret under *GitHub, repo, Settings, Secrets and variables,
  Actions*, or run `gh secret set SMTP_PASSWORD` (it prompts, so the value never lands in shell history).
- **Rotating the password:** change the mailbox password in cPanel, update `SMTP_PASSWORD`, re-run the
  deploy workflow.
- **Local preview with a working form:** `pnpm build`, then `bash tools/form-test/preview.sh` inside WSL (start it hidden
  with `Start-Process` so WSL stays awake; the header of that file has the exact command). It serves `dist/` with real PHP at
  http://localhost:8088 and keeps each enquiry in a fake SMTP server instead of sending it; read them with
  `node tools/form-test/show-mail.mjs`. Stop it with `bash tools/form-test/preview.sh stop`. It shares port 8088 with the nginx
  preview, so run one at a time.
- **Local dev:** `pnpm dev` and the nginx preview do not run PHP, so submitting there does not work.
  Test the back end with
  `wsl -e bash -lc "cd /mnt/d/FluxMigrate/fluxmigrate && pnpm build && bash tools/form-test/run.sh"`
  (real PHP 8.3 in Docker, real PHPMailer, a fake SMTP server). It cannot cover the production `.htaccess`
  or the real mailbox: the deploy workflow checks the first, and one real enquiry checks the second.
- **Changing fields:** add the input in `contact.astro`, plus a matching `fm_field(...)` line and a body
  line in `contact-submit.php`. Length limits live in both places (`maxlength` and the PHP).

---

## Newsletter opt-in

A popup (`src/layouts/components/OptInPopup.astro`, wired in `main.js`) collects an email address with consent and saves it for the team.
Copy is in `optIn` in `src/data/content.ts` (no choice of topics: every subscriber gets blog posts, the newsletter and service updates); the landing page wording is `subscriptionPage` there.

```
popup --fetch--> subscribe.php --> subscribers.sqlite (status: pending) --SMTP--> visitor: "confirm" link
                                                                                      |
/subscription.html#confirmed <-- subscribe-confirm.php (status: confirmed) --SMTP--> info@: "New subscriber"
/subscription.html#unsubscribed <-- subscribe-unsubscribe.php (status: unsubscribed)
```

- **Where the addresses are:** `fm-data/subscribers.sqlite`, in the hosting account's home folder beside `public_html` (default: the parent
  of the web root). Set the optional GitHub secret `DATA_DIR` to put it elsewhere. It must be **outside the web root**: the FTP deploy deletes
  anything it did not upload and a web server would serve anything inside. The code refuses a folder inside the web root.
- **Reading the list:** download `subscribers.sqlite` with cPanel File Manager and open it in a SQLite viewer (DB Browser for SQLite is free),
  or rely on the "New subscriber" mail sent to `MAIL_TO` on every confirmation. Columns: `email`, `interests` (always `blog,newsletter,updates`),
  `status` (`pending`, `confirmed`, `unsubscribed`), `consent_text`, `source_page`, `ip_hash` (keyed hash, not the IP), `confirm_token`,
  `unsub_token`, `created_at`, `confirm_sent_at`, `confirmed_at`, `unsubscribed_at`. Mailing list = `status = 'confirmed'`.
- **Consent:** unticked required checkbox, wording `optIn.consent`, stored with the row. It must equal `FM_CONSENT_TEXT` in
  `public/_form/subscribers.php` (`verify-dist` checks). Double opt-in: nothing counts until the link in the confirmation mail is opened.
- **Sending:** this collects and stores addresses; it does not send newsletters. Every mail you send must carry
  `https://www.fluxmigrate.com/subscribe-unsubscribe.php?t=<unsub_token>` for that row. Bulk mail from shared hosting hurts deliverability;
  prefer exporting confirmed rows to a sending service.
- **Protection:** same layers as the contact form (captcha, honeypot, fill time, Origin check, strikes and lockout), plus 5 sign-ups per IP and
  100 overall per hour. The reply never says whether an address is already on the list.
- **Popup behaviour:** opens after 25 s or 40% scroll, once per page view, on every page until the visitor subscribes (closing it hides it only for that page); subscribing is remembered for 12 months in `localStorage` key `fm-optin`, only with the visitor's functional-storage consent (see the consent banner), so a visitor who rejected Functional never sees it. It waits until the consent choice is made. Never on contact, thank-you, subscription and 404 pages (`popup` prop of `Base.astro`). Any element with `data-optin-open` reopens it.
- **Confirmation email:** `public/_form/email-template.php` (HTML + plain text). The welcome wording is a list, `FM_MAIL_VARIANTS` (welcome line, tagline, statement per entry); each email picks one at random, so people get different words. Add or edit entries there (a test checks every entry is complete, ASCII and free of "best/leading/trusted" and blog/newsletter wording). The button label is `FM_MAIL_BUTTON`; the logo is `public/brand/email-logo.png`. Keep the HTML table-based, inline-styled and ASCII.
- **Unconfirmed addresses:** saved at once as `pending`, and the team gets a "New sign-up (not yet confirmed)" mail; the confirmation mail follows. Never send newsletters to them: mailing list = `status = 'confirmed'`.
- **Config:** optional secrets `DATA_DIR` and `SITE_URL` (link base in mails; default `https://www.fluxmigrate.com`), written into
  `mail-config.php` by `tools/write-mail-config.mjs`. Needs PHP's `pdo_sqlite` (normally on).
- **Local test:** `bash tools/form-test/run.sh` (phases `sub-main`, `sub-abuse`, `sub-rate`); for a browser, `PORT=8090 bash tools/form-test/preview.sh`
  (use another port if the nginx preview holds 8088), then read mails with `node tools/form-test/show-mail.mjs`.

---

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: install (`pnpm --frozen-lockfile`) →
`pnpm build` → `node tools/verify-dist.mjs` → `SamKirkland/FTP-Deploy-Action` syncing `dist/`.
Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, plus `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
for the contact form (a missing one fails the deploy at the "Write the mail config" step). After the
sync, a step requests `/contact-submit.php` (must answer 405, proving PHP runs) and `/mail-config.php`
(must be refused). The action tracks what it uploaded, so
files that no longer exist (the old `assets/` folder and hand-written pages) are removed from the
host on the first run.

`public/.htaccess` (Apache/LiteSpeed) provides the 404 page, extensionless URLs, `/index.html`→`/`,
caching, gzip and security headers. The host already redirects http→https; the `.htaccess` redirects the bare domain to www (FM-109: browsers keep consent and
"subscribed" per address, so two live addresses meant being asked twice). The deploy workflow checks it.

## Licences

Automark © Themefisher, MIT — [`LICENSE-THEME-AUTOMARK`](LICENSE-THEME-AUTOMARK). Its images are
"demonstration purposes only" and are not used. Other components and fonts:
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
