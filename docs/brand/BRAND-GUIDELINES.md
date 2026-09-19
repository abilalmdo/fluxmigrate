# FluxMigrate brand guidelines

> **Update, 19 September 2026.** The website now runs on the Automark theme (violet `#937AFF` / `#4D36D0` on near-black), so the site's UI palette is set in `src/config/theme.json`, not by this document. The mark itself is unchanged: its azure-to-violet gradient sits comfortably on that theme, and the rules below still govern the logo. Where this file says "adopt the assets on the site", that is done — the site loads `public/brand/fluxmigrate-lockup-horizontal.svg`, and the other variants live in `docs/brand/svg/` (regenerate with `python tools/brand/genbrand.py`). Colours in the section on the site's own accent (`#38BDF8 → #A855F7`) describe the old site and are historical.

Version 1.0 — 19 September 2026.

---

## The mark

Four slanted bars step to the right. The leading bar is detached from the row it belongs to.
Together they form an implied capital **F** and a picture of what the company sells: workloads
moving from one platform to another, with the first one already arrived.

Design constraints it was built to satisfy:

- **One idea.** The previous logo combined a cloud, an infinity loop, a gear, code brackets
  and two arrows. Five metaphors compete; none survives being shrunk.
- **Legible at 24 px.** Geometry only. No inner detail, no thin strokes, no text inside the mark.
- **Monochrome-safe.** The mark works filled with a single colour, which the gradient version
  cannot be assumed to do.
- **Vector-native.** Every file is SVG. Raster exports are generated, never hand-edited.

The slant is a constant 35° from vertical across all four bars, so the mark keeps one optical
axis at any size.

---

## Files

### Vector sources

| File | Use |
| --- | --- |
| `fluxmigrate-mark.svg` | icon only, gradient, transparent background |
| `fluxmigrate-mark-white.svg` | icon on dark or photographic backgrounds |
| `fluxmigrate-mark-ink.svg` | icon on white or light backgrounds |
| `fluxmigrate-lockup-horizontal.svg` | **primary logo** — icon + wordmark, for dark backgrounds |
| `fluxmigrate-lockup-horizontal-dark.svg` | same lockup with ink wordmark, for light backgrounds |
| `fluxmigrate-lockup-horizontal-white.svg` | one-colour white, for print and overlays |
| `fluxmigrate-lockup-horizontal-ink.svg` | one-colour black, for fax, stamps, single-colour print |
| `fluxmigrate-lockup-vertical.svg` | stacked lockup for square-ish spaces |
| `fluxmigrate-lockup-dotcom.svg` | alternate reading `fluxmigrate.com`, matches the current site nav |
| `fluxmigrate-favicon.svg` | simplified three-shape mark on a dark tile, for 16–48 px |
| `fluxmigrate-app-tile.svg` | full-bleed square tile, for app icons and avatars |
| `fluxmigrate-og.svg` | 1200 × 630 social card |

### Generated exports (`png/`)

`logo-icon.png` (1024) · `logo-icon@2048.png` · `logo-icon-white.png` (1024) ·
`logo-lockup.png` (2400 × 412) · `logo-lockup@4800.png` (4800 × 824) ·
`logo-lockup-white.png` · `logo-lockup-ink.png` · `logo-lockup-dotcom.png` ·
`logo-vertical.png` (1600) · `app-tile-1024.png` · `apple-touch-icon.png` (180) ·
`favicon-16/32/48/192/512.png` · `favicon.ico` (7 sizes, 16–256) ·
`og-image.png` (1200 × 630) · `og-image@2x.png` (2400 × 1260).

All PNGs carry an alpha channel except the two Open Graph cards, which are flattened onto
`#070B14` because social scrapers handle transparency inconsistently.

To regenerate every file, see the Brand assets section of the repository README.

---

## Colour

| Name | Hex | Use |
| --- | --- | --- |
| Azure | `#2D8FF5` | gradient start, primary accent, links |
| Violet | `#7C5CFC` | gradient end, secondary accent only |
| Ink | `#070B14` | logo on light, page ground |
| Tile | `#0B1020` | favicon and app-icon background |
| Paper | `#FFFFFF` | reversed logo |

The gradient runs bottom-left to top-right, azure to violet, across the mark's bounding box
only — never across a whole page or a large panel.

This is a deliberate tightening of the site's current `#38BDF8 → #A855F7`. That pairing is
the default cyan-to-purple of almost every AI-generated tech brand of the last three years.
Moving the blue toward true azure and the purple away from magenta reads as infrastructure
rather than as a generative-art preset, and keeps contrast on the dark ground.

**Single-colour rule.** Below 24 px, or in any one-colour context, use the flat white or flat
ink mark. The gradient is decoration; it must never be load-bearing.

---

## Wordmark

Inter Display SemiBold, tracking −0.015 em, converted to outlines. The lockup files contain
vector paths, not `<text>`, so they render identically without Inter installed.

Preferred wordmark is **FluxMigrate**, capital F and capital M, no domain suffix. The
`.com` alternate exists to match the current site header; prefer it only where the domain
itself is the message, such as a business card or an ad.

---

## Clear space and minimum size

- **Clear space:** one bar height (`10/64` of the mark's height) on every side. Nothing
  enters that zone.
- **Minimum size, horizontal lockup:** 120 px wide on screen, 30 mm in print.
- **Minimum size, mark alone:** 24 px. Below that, use `fluxmigrate-favicon.svg`, which
  drops the fourth bar and thickens the remaining three.

## Don't

- Do not re-add the cloud, gear, infinity or code-bracket motifs.
- Do not rotate, skew, mirror or re-space the bars.
- Do not apply shadows, glows, bevels or outlines to the mark.
- Do not place the gradient mark on a mid-tone or busy background — use white or ink there.
- Do not recolour the bars individually.
- Do not set the wordmark in a different family and call it the logo.

---

## Adopting the new assets on the site

The HTML still points at the legacy raster files in `assets/`. When the new identity is
approved, the swap is mechanical:

1. Copy `assets/brand/png/*` over the matching names in `assets/`, and copy
   `assets/brand/fluxmigrate-favicon.svg` to `assets/favicon.svg`.
2. In all ten HTML files, change `assets/logo-icon.png` to `assets/brand/fluxmigrate-mark.svg`
   (twice per page: nav and footer) and add `width` and `height` attributes.
3. Add `<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">` ahead of the PNG
   favicon links, so modern browsers take the vector.
4. Update the `:root` colour tokens to the palette above if the tightened colours are adopted.

Step 1 alone removes roughly 2.2 MB of image payload from the site.

---

## Rejected concepts

Kept for the record, as `concept-b-mark.svg` and `concept-c-mark.svg`.

- **Concept B, Migration Arc.** A source node, a rising arc and an arrowhead into a target
  node. The meaning is the most literal of the three, but the arc is a thin stroke that
  disappears below 32 px, and the composition is close to a generic "export" UI icon.
- **Concept C, Shift Tiles.** Two rounded tiles offset on a diagonal, one outlined and one
  filled. It scales beautifully but carries no letterform and reads as the standard
  duplicate/copy icon rather than as a company.

Concept A was chosen because it is the only one of the three that is simultaneously
distinctive, letter-bearing and legible at favicon size.
