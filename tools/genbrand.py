# -*- coding: utf-8 -*-
import os
from wordmark import wordmark

OUT = r"D:/FluxMigrate/fluxmigrate/assets/brand"
FONT = "inter/extras/otf/InterDisplay-SemiBold.otf"
AZURE, VIOLET, AZURE_SOFT = "#2D8FF5", "#7C5CFC", "#3E9BF0"
INK, WHITE = "#070B14", "#FFFFFF"

# --- mark geometry (64 grid), bbox x 10..55, y 12..52 ---
MARK_PATHS = [
    "M17 12h24l-7 10H10z",
    "M45 12h10l-7 10H38z",
    "M17 27h20l-7 10H10z",
    "M17 42h11l-7 10H10z",
]
MARK_W, MARK_H = 45.0, 40.0

def grad(gid, x1, y1, x2, y2, c1=AZURE, c2=VIOLET):
    return (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
            f'x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>')

def mark_group(paint, tx=0.0, ty=0.0, scale=1.0):
    t = f' transform="translate({tx:g} {ty:g}) scale({scale:g})"' if (tx or ty or scale != 1) else ""
    body = "".join(f'<path d="{d}"/>' for d in MARK_PATHS)
    return f'<g fill="{paint}"{t}>{body}</g>'

def text_group(font_size, paint, tx, baseline_y, text, tracking=-0.015):
    d, scale, adv, upm = wordmark(FONT, text, font_size, tracking)
    g = (f'<g fill="{paint}" transform="translate({tx:g} {baseline_y:g}) '
         f'scale({scale:.6f} -{scale:.6f})"><path d="{d}"/></g>')
    return g, adv

def svg(vb_w, vb_h, defs, body, title, desc, vb_x=0, vb_y=0):
    d = f"<defs>{defs}</defs>" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb_x} {vb_y} {vb_w:g} {vb_h:g}" '
            f'width="{vb_w:g}" height="{vb_h:g}" role="img" aria-labelledby="t d">'
            f'<title id="t">{title}</title><desc id="d">{desc}</desc>{d}{body}</svg>')

def write(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content + "\n")
    print(name, len(content))

DESC_MARK = ("Four slanted bars stepping to the right, the leading one detached, "
             "forming an implied letter F and representing workloads in migration.")

# 1. mark, gradient
write("fluxmigrate-mark.svg", svg(64, 64,
      grad("fmMark", 10, 52, 55, 12),
      mark_group("url(#fmMark)"), "FluxMigrate", DESC_MARK))

# 2. mono marks
write("fluxmigrate-mark-white.svg", svg(64, 64, "", mark_group(WHITE), "FluxMigrate", DESC_MARK))
write("fluxmigrate-mark-ink.svg",  svg(64, 64, "", mark_group(INK),   "FluxMigrate", DESC_MARK))

# 3. horizontal lockups
CAP_RATIO = 0.7275          # Inter cap height / em
CAP = 24.0
FS  = CAP / CAP_RATIO
GAP = 15.0
MARK_TX, MARK_TY = -10.0, -12.0      # move mark bbox to 0,0
BASE_Y = MARK_H / 2 + CAP / 2        # baseline so cap block is vertically centred on the mark

def horizontal(fname, paint_mark, paint_text, text, defs="", accent=None, accent_text=None):
    body = mark_group(paint_mark, MARK_TX, MARK_TY)
    tx = MARK_W + GAP
    g1, adv1 = text_group(FS, paint_text, tx, BASE_Y, text)
    body += g1
    total = tx + adv1
    if accent_text:
        g2, adv2 = text_group(FS, accent, total, BASE_Y, accent_text)
        body += g2
        total += adv2
    w = round(total, 1)
    write(fname, svg(w, MARK_H, defs, body, "FluxMigrate", DESC_MARK))

horizontal("fluxmigrate-lockup-horizontal.svg", "url(#fmMark)", "#EEF2FA", "FluxMigrate",
           grad("fmMark", 10, 52, 55, 12))
horizontal("fluxmigrate-lockup-horizontal-dark.svg", "url(#fmMark)", "#10162A", "FluxMigrate",
           grad("fmMark", 10, 52, 55, 12))
horizontal("fluxmigrate-lockup-horizontal-white.svg", WHITE, WHITE, "FluxMigrate")
horizontal("fluxmigrate-lockup-horizontal-ink.svg", INK, INK, "FluxMigrate")
horizontal("fluxmigrate-lockup-dotcom.svg", "url(#fmMark)", "#EEF2FA", "fluxmigrate",
           grad("fmMark", 10, 52, 55, 12), accent=AZURE, accent_text=".com")

# 4. vertical lockup
def vertical(fname, paint_mark, paint_text, defs=""):
    cap_v = 18.0
    fs_v = cap_v / CAP_RATIO
    d, scale, adv, upm = wordmark(FONT, "FluxMigrate", fs_v, -0.015)
    w = max(MARK_W, adv)
    mark_x = (w - MARK_W) / 2 - 10
    body = mark_group(paint_mark, mark_x, -12)
    baseline = MARK_H + 18 + cap_v
    tx = (w - adv) / 2
    body += (f'<g fill="{paint_text}" transform="translate({tx:.2f} {baseline:g}) '
             f'scale({scale:.6f} -{scale:.6f})"><path d="{d}"/></g>')
    write(fname, svg(round(w, 1), baseline + 6, defs, body, "FluxMigrate", DESC_MARK))

vertical("fluxmigrate-lockup-vertical.svg", "url(#fmMark)", "#EEF2FA", grad("fmMark", 10, 52, 55, 12))
vertical("fluxmigrate-lockup-vertical-white.svg", WHITE, WHITE)

# 5. favicon - simplified, thicker bars, ink tile so it survives light and dark browser chrome
FAV = ('<rect width="64" height="64" rx="14" fill="#0B1020"/>'
       '<g fill="url(#fmFav)">'
       '<path d="M22 16h20l-8 12H14z"/>'
       '<path d="M46 16h8l-8 12h-8z"/>'
       '<path d="M22 36h14l-8 12H14z"/>'
       '</g>')
write("fluxmigrate-favicon.svg", svg(64, 64, grad("fmFav", 14, 48, 54, 16), FAV,
      "FluxMigrate", "Simplified FluxMigrate mark on a dark rounded tile, for favicon and app icon use."))

# 6. app / social tile (square, full-bleed background)
TILE = ('<rect width="512" height="512" rx="112" fill="#0B1020"/>'
        + mark_group("url(#fmTile)", 61.0, 64.0, 6.0))
write("fluxmigrate-app-tile.svg", svg(512, 512, grad("fmTile", 121, 376, 391, 136), TILE,
      "FluxMigrate", DESC_MARK))

# 7. Open Graph / social card, 1200x630 (vector source, renders crisp at any multiple)
def og_card():
    cap = 66.0
    fs = cap / CAP_RATIO
    d1, s1, adv1, _ = wordmark(FONT, "FluxMigrate", fs, -0.018)
    tag_cap = 23.0
    fs_t = tag_cap / 0.7275
    d2, s2, adv2, _ = wordmark("inter/extras/otf/Inter-Medium.otf", "Cloud  ·  DevOps  ·  SRE  ·  Platform Engineering", fs_t, 0.01)
    mark_s = 2.9
    mark_w, mark_h = MARK_W * mark_s, MARK_H * mark_s
    gap = 34.0
    row_w = mark_w + gap + adv1
    x0 = (1200 - row_w) / 2
    row_cy = 290.0
    body = (
        '<rect width="1200" height="630" fill="#070B14"/>'
        '<rect width="1200" height="630" fill="url(#ogGlowA)"/>'
        '<rect width="1200" height="630" fill="url(#ogGlowB)"/>'
        + mark_group("url(#ogMark)", x0 - 10 * mark_s, row_cy - mark_h / 2 - 12 * mark_s, mark_s)
        + f'<g fill="#F2F5FC" transform="translate({x0 + mark_w + gap:.2f} {row_cy + cap/2:.2f}) '
          f'scale({s1:.6f} -{s1:.6f})"><path d="{d1}"/></g>'
        + f'<g fill="#93A0C2" transform="translate({(1200-adv2)/2:.2f} 420) '
          f'scale({s2:.6f} -{s2:.6f})"><path d="{d2}"/></g>'
        + f'<rect x="{(1200-120)/2:.0f}" y="470" width="120" height="4" rx="2" fill="url(#ogRule)"/>'
    )
    defs = (
        grad("ogMark", x0, row_cy + mark_h/2, x0 + mark_w, row_cy - mark_h/2)
        + grad("ogRule", 540, 0, 660, 0)
        + '<radialGradient id="ogGlowA" cx="0.18" cy="0.1" r="0.7">'
          '<stop offset="0" stop-color="#2D8FF5" stop-opacity="0.20"/>'
          '<stop offset="1" stop-color="#2D8FF5" stop-opacity="0"/></radialGradient>'
          '<radialGradient id="ogGlowB" cx="0.85" cy="0.95" r="0.7">'
          '<stop offset="0" stop-color="#7C5CFC" stop-opacity="0.22"/>'
          '<stop offset="1" stop-color="#7C5CFC" stop-opacity="0"/></radialGradient>'
    )
    return svg(1200, 630, defs, body, "FluxMigrate",
               "FluxMigrate social card: the FluxMigrate logo above the line Cloud, DevOps, SRE, Platform Engineering.")

write("fluxmigrate-og.svg", og_card())
