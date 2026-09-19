# -*- coding: utf-8 -*-
"""
Replaces the legacy infinity-loop hero graphic on every page with one of four
brand-aligned diagrams. Each diagram reuses the logo's slanted-bar motif and the
azure-to-violet gradient, and each carries a different idea so the pages do not
all look alike.

Run from the repository root:  python tools/hero_visuals.py
Idempotent: matches any <svg> inside .hero-visual and rewrites it.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFS = '''  <defs>
    <linearGradient id="%(p)sg" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#2D8FF5"/><stop offset="1" stop-color="#7C5CFC"/>
    </linearGradient>
    <linearGradient id="%(p)sgs" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#2D8FF5" stop-opacity=".5"/>
      <stop offset="1" stop-color="#7C5CFC" stop-opacity=".5"/>
    </linearGradient>
    <radialGradient id="%(p)sglow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#7C5CFC" stop-opacity=".34"/>
      <stop offset="1" stop-color="#7C5CFC" stop-opacity="0"/>
    </radialGradient>
  </defs>'''


def shell(prefix, body, label):
    return (
        '<svg viewBox="0 0 440 340" fill="none" xmlns="http://www.w3.org/2000/svg" '
        'role="img" aria-label="%s">\n%s\n%s\n</svg>'
        % (label, DEFS % {"p": prefix}, body)
    )


# --------------------------------------------------------------------------
# A. Migration corridor — workloads leaving an existing estate for a platform
# --------------------------------------------------------------------------
A = shell("a", '''  <circle cx="318" cy="170" r="132" fill="url(#aglow)"/>

  <rect x="22" y="96" width="112" height="148" rx="16" fill="rgba(140,162,204,.06)" stroke="rgba(140,162,204,.30)"/>
  <rect x="40" y="118" width="76" height="14" rx="5" fill="rgba(160,180,220,.34)"/>
  <rect x="40" y="144" width="76" height="14" rx="5" fill="rgba(160,180,220,.26)"/>
  <rect x="40" y="170" width="76" height="14" rx="5" fill="rgba(160,180,220,.19)"/>
  <rect x="40" y="196" width="44" height="14" rx="5" fill="rgba(160,180,220,.13)"/>

  <rect x="286" y="80" width="132" height="180" rx="20" fill="rgba(45,143,245,.07)" stroke="url(#ags)" stroke-width="1.5"/>
  <g stroke="url(#ags)" stroke-width="1">
    <path d="M312 112h80M312 156h80M312 200h80M312 228h80"/>
    <path d="M312 112v116M352 112v116M392 112v116"/>
  </g>
  <g fill="url(#ag)">
    <circle cx="312" cy="112" r="4.5"/><circle cx="352" cy="112" r="4.5"/><circle cx="392" cy="112" r="4.5"/>
    <circle cx="312" cy="156" r="4.5"/><circle cx="352" cy="156" r="4.5"/><circle cx="392" cy="156" r="4.5"/>
    <circle cx="312" cy="200" r="4.5"/><circle cx="352" cy="200" r="4.5"/><circle cx="392" cy="200" r="4.5"/>
    <circle cx="312" cy="228" r="4.5"/><circle cx="352" cy="228" r="4.5"/><circle cx="392" cy="228" r="4.5"/>
  </g>

  <g class="loop-arrow" stroke="url(#ag)" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9">
    <path d="M142 126h136"/><path d="M142 170h136"/><path d="M142 214h136"/>
  </g>
  <g fill="url(#ag)">
    <path d="M186 116h30l-9 14h-30z"/><path d="M222 116h13l-9 14h-13z"/>
    <path d="M196 160h26l-9 14h-26z"/>
    <path d="M206 204h18l-9 14h-18z"/>
  </g>
  <g fill="#6FB4FF"><circle cx="142" cy="126" r="3.5"/><circle cx="142" cy="170" r="3.5"/><circle cx="142" cy="214" r="3.5"/></g>
  <g fill="#A98BFF"><circle cx="278" cy="126" r="3.5"/><circle cx="278" cy="170" r="3.5"/><circle cx="278" cy="214" r="3.5"/></g>''',
          "Workloads moving from an existing estate onto a modern platform")

# --------------------------------------------------------------------------
# B. Delivery pipeline — commit to production, automated
# --------------------------------------------------------------------------
B = shell("b", '''  <circle cx="220" cy="170" r="140" fill="url(#bglow)"/>

  <path d="M44 170h352" stroke="rgba(140,162,204,.22)" stroke-width="1.5"/>
  <g class="loop-arrow" stroke="url(#bg)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 10">
    <path d="M92 170h68M204 170h68M316 170h44"/>
  </g>

  <g>
    <rect x="44" y="146" width="48" height="48" rx="15" fill="rgba(45,143,245,.10)" stroke="url(#bg)" stroke-width="1.6"/>
    <path d="M60 165h18l-5 10H55z" fill="url(#bg)"/>
    <rect x="160" y="146" width="48" height="48" rx="15" fill="rgba(140,162,204,.05)" stroke="rgba(140,162,204,.30)" stroke-width="1.4"/>
    <path d="M176 165h18l-5 10h-18z" fill="rgba(160,180,220,.55)"/>
    <rect x="272" y="146" width="48" height="48" rx="15" fill="rgba(140,162,204,.05)" stroke="rgba(140,162,204,.30)" stroke-width="1.4"/>
    <path d="M288 165h18l-5 10h-18z" fill="rgba(160,180,220,.55)"/>
    <rect x="360" y="146" width="48" height="48" rx="15" fill="rgba(124,92,252,.12)" stroke="url(#bg)" stroke-width="1.6"/>
    <path d="M376 165h18l-5 10h-18z" fill="url(#bg)"/>
  </g>

  <g stroke="rgba(140,162,204,.24)" stroke-width="1.2" stroke-linecap="round">
    <path d="M68 146V96M184 146V110M296 146V110M384 146V96"/>
  </g>
  <g fill="rgba(160,180,220,.40)">
    <rect x="50" y="76" width="36" height="8" rx="4"/>
    <rect x="166" y="92" width="36" height="8" rx="4"/>
    <rect x="278" y="92" width="36" height="8" rx="4"/>
    <rect x="366" y="76" width="36" height="8" rx="4"/>
  </g>

  <g stroke="rgba(140,162,204,.24)" stroke-width="1.2" stroke-linecap="round">
    <path d="M68 194v42M184 194v28M296 194v28M384 194v42"/>
  </g>
  <g fill="url(#bgs)">
    <rect x="52" y="244" width="32" height="6" rx="3"/>
    <rect x="168" y="230" width="32" height="6" rx="3"/>
    <rect x="280" y="230" width="32" height="6" rx="3"/>
    <rect x="368" y="244" width="32" height="6" rx="3"/>
  </g>

  <path d="M44 276h352" stroke="rgba(140,162,204,.14)" stroke-width="1"/>''',
          "An automated delivery pipeline carrying a change from commit to production")

# --------------------------------------------------------------------------
# C. Reliability — a service level held through an incident
# --------------------------------------------------------------------------
C = shell("c", '''  <circle cx="220" cy="170" r="140" fill="url(#cglow)"/>

  <rect x="36" y="70" width="368" height="200" rx="20" fill="rgba(140,162,204,.04)" stroke="rgba(140,162,204,.22)"/>
  <rect x="36" y="118" width="368" height="86" fill="rgba(45,212,191,.06)"/>
  <path d="M36 118h368" stroke="rgba(45,212,191,.38)" stroke-width="1" stroke-dasharray="5 6"/>
  <path d="M36 204h368" stroke="rgba(45,212,191,.38)" stroke-width="1" stroke-dasharray="5 6"/>

  <g stroke="rgba(140,162,204,.10)" stroke-width="1">
    <path d="M110 70v200M184 70v200M258 70v200M332 70v200"/>
  </g>

  <path d="M52 176 86 168 120 182 154 160 188 172 208 236 232 150 266 164 300 146 334 158 368 140 388 150"
        stroke="url(#cg)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>

  <circle cx="208" cy="236" r="6" fill="#F5A524"/>
  <circle cx="208" cy="236" r="12" fill="none" stroke="#F5A524" stroke-opacity=".35" stroke-width="1.5"/>
  <circle cx="232" cy="150" r="5.5" fill="url(#cg)"/>

  <g class="loop-arrow" stroke="url(#cg)" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="3 8">
    <path d="M208 236h24"/>
  </g>

  <g fill="url(#cg)">
    <path d="M56 288h22l-7 12H49z"/><path d="M84 288h10l-7 12H77z"/>
  </g>
  <rect x="104" y="291" width="86" height="6" rx="3" fill="rgba(160,180,220,.22)"/>''',
          "A service level band held steady through an incident and recovery")

# --------------------------------------------------------------------------
# D. Embedded engineers — specialists joining an existing team
# --------------------------------------------------------------------------
D = shell("d", '''  <circle cx="220" cy="170" r="140" fill="url(#dglow)"/>

  <g stroke="rgba(140,162,204,.26)" stroke-width="1.2">
    <path d="M220 170 110 96M220 170 330 96M220 170 76 200M220 170 364 200M220 170 150 268M220 170 290 268"/>
  </g>
  <g class="loop-arrow" stroke="url(#dg)" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9">
    <path d="M220 170 330 96"/><path d="M220 170 290 268"/>
  </g>

  <rect x="184" y="134" width="72" height="72" rx="22" fill="rgba(45,143,245,.10)" stroke="url(#dg)" stroke-width="1.6"/>
  <g fill="url(#dg)">
    <path d="M206 154h26l-7 10h-26z"/><path d="M236 154h10l-7 10h-10z"/>
    <path d="M206 170h20l-7 10h-20z"/><path d="M206 186h12l-7 10h-12z"/>
  </g>

  <g fill="rgba(140,162,204,.07)" stroke="rgba(140,162,204,.30)" stroke-width="1.3">
    <circle cx="110" cy="96" r="21"/><circle cx="76" cy="200" r="21"/>
    <circle cx="150" cy="268" r="21"/><circle cx="364" cy="200" r="21"/>
  </g>
  <g fill="rgba(160,180,220,.42)">
    <path d="M104 91h14l-4 8h-14z"/><path d="M70 195h14l-4 8H66z"/>
    <path d="M144 263h14l-4 8h-14z"/><path d="M358 195h14l-4 8h-14z"/>
  </g>

  <g fill="rgba(124,92,252,.14)" stroke="url(#dg)" stroke-width="1.8">
    <circle cx="330" cy="96" r="23"/><circle cx="290" cy="268" r="23"/>
  </g>
  <g fill="url(#dg)">
    <path d="M323 90h16l-5 9h-16z"/><path d="M325 102h10l-5 9h-10z"/>
    <path d="M283 262h16l-5 9h-16z"/><path d="M285 274h10l-5 9h-10z"/>
  </g>''',
          "Specialist engineers joining an existing delivery team")

ASSIGNMENT = {
    "index.html": A,
    "cloud-migration.html": A,
    "vmware-modernization.html": A,
    "devops-platform-engineering.html": B,
    "technology.html": B,
    "sre-reliability-engineering.html": C,
    "industries.html": C,
    "staff-augmentation.html": D,
    "about.html": D,
    "contact.html": D,
}

PATTERN = re.compile(
    r'(<div class="hero-visual">\s*)<svg\b.*?</svg>', re.S)

if __name__ == "__main__":
    for page, art in ASSIGNMENT.items():
        path = os.path.join(ROOT, page)
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        new, n = PATTERN.subn(lambda m: m.group(1) + art, html, count=1)
        if n:
            with open(path, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(new)
        print("%-38s %s" % (page, "replaced" if n else "NO hero-visual found"))
