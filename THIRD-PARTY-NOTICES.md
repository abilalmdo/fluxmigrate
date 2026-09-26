# Third-party notices

fluxmigrate.com is built on the following third-party work.

## Automark (theme)

- **What:** the Astro + Tailwind CSS theme "Automark" — layout system, components, CSS and
  scripts that this site was adapted from (`src/styles/*`, `src/layouts/*`, `src/scripts/*`,
  `scripts/themeGenerator.js`).
- **Author:** Themefisher — https://themefisher.com — distributed by ThemeWagon.
- **Licence:** MIT. The full licence text is in [`LICENSE-THEME-AUTOMARK`](LICENSE-THEME-AUTOMARK)
  and must stay with every copy or substantial portion of the code.
- **Images:** the theme states *"Image license: Demonstration purposes only."* None of its
  images are used. All imagery on this site is original (see `tools/images/`).

## PHPMailer (contact form)

- **What:** the SMTP client used by `public/contact-submit.php`. `PHPMailer.php`, `SMTP.php` and
  `Exception.php` are shipped unmodified in `public/_form/phpmailer/` (version in `VERSION`).
- **Author:** the PHPMailer project, https://github.com/PHPMailer/PHPMailer
- **Licence:** GNU LGPL 2.1. The full text is in `public/_form/phpmailer/LICENSE` and ships with the
  files. The library is used as a separate, unmodified component; to change it, replace those files with
  a newer release.

## Fonts

- **Urbanist** and **Inter Tight** — Google Fonts, SIL Open Font License 1.1. Downloaded at build
  time by Astro's font pipeline and served from this site's own origin.
- **Inter** — Rasmus Andersson, SIL Open Font License 1.1. `tools/images/fonts/` holds the
  files used to set text inside generated illustrations, with their licence in
  `tools/images/fonts/OFL-Inter.txt`. They are build tooling and are not served to visitors.

## Libraries

Runtime and build dependencies are listed in `package.json`; notable ones: Astro (MIT),
Tailwind CSS (MIT), `@astrojs/sitemap` (MIT), `marked` (MIT), `github-slugger` (ISC),
GSAP (GreenSock "Standard No Charge" licence — see https://gsap.com/standard-license/),
`sharp` (Apache-2.0), `@resvg/resvg-js` (MPL-2.0).
