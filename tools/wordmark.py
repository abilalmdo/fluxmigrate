import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Identity

def wordmark(font_path, text, cap_px, tracking_em=0.0, y_baseline=0.0, x0=0.0):
    f = TTFont(font_path)
    upm = f['head'].unitsPerEm
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    scale = cap_px / upm
    pen_out = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
    x = x0 / scale
    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None:
            raise SystemExit(f"missing glyph {ch!r}")
        g = gs[gname]
        tp = TransformPen(pen_out, Identity.translate(x, 0))
        g.draw(tp)
        x += g.width + tracking_em * upm
    d = pen_out.getCommands()
    adv_px = x * scale
    return d, scale, adv_px, upm

if __name__ == "__main__":
    font, text, cap = sys.argv[1], sys.argv[2], float(sys.argv[3])
    track = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
    d, scale, adv, upm = wordmark(font, text, cap, track)
    print(f"SCALE {scale:.6f}")
    print(f"ADVANCE_PX {adv:.2f}")
    print(f"UPM {upm}")
    print("D " + d)
