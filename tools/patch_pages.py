# -*- coding: utf-8 -*-
"""
Rewrites the ten static pages onto the shared design system.

What it does per page:
  * swaps the inlined <style> block for assets/site.css
  * updates the Google Fonts request to Inter / Inter Tight / JetBrains Mono
  * rewrites the favicon block and adds theme-color + web manifest
  * adds rel=canonical and normalises og:url
  * injects Organization / page-type JSON-LD
  * adds a skip link and a <main id="main"> landmark
  * replaces the nav with a version that has a working mobile drawer
  * points the logo at the new vector mark and gives every <img> dimensions
  * adds the shared nav script

Run from the repository root:  python tools/patch_pages.py
It is idempotent: running it twice produces the same output.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.fluxmigrate.com"

PAGES = [
    "index.html", "cloud-migration.html", "devops-platform-engineering.html",
    "sre-reliability-engineering.html", "vmware-modernization.html",
    "staff-augmentation.html", "technology.html", "industries.html",
    "about.html", "contact.html",
]

NAV_ITEMS = [
    ("cloud-migration.html", "Services"),
    ("staff-augmentation.html", "Staff Augmentation"),
    ("devops-platform-engineering.html", "DevOps"),
    ("sre-reliability-engineering.html", "SRE"),
    ("vmware-modernization.html", "VMware"),
    ("technology.html", "Technology"),
    ("industries.html", "Industries"),
    ("about.html", "About"),
]

# page -> (schema @type, breadcrumb label, optional Service name)
PAGE_SCHEMA = {
    "index.html": ("WebSite", None, None),
    "cloud-migration.html": ("Service", "Cloud Migration", "Cloud Migration and Modernization"),
    "devops-platform-engineering.html": ("Service", "DevOps & Platform Engineering", "DevOps and Platform Engineering"),
    "sre-reliability-engineering.html": ("Service", "SRE & Reliability", "Site Reliability Engineering"),
    "vmware-modernization.html": ("Service", "VMware Modernization", "VMware Modernization and Virtualization Migration"),
    "staff-augmentation.html": ("Service", "Staff Augmentation", "Engineering Staff Augmentation"),
    "technology.html": ("CollectionPage", "Technology", None),
    "industries.html": ("CollectionPage", "Industries", None),
    "about.html": ("AboutPage", "About", None),
    "contact.html": ("ContactPage", "Contact", None),
}

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="preload" as="style" '
    'href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&'
    'family=Inter+Tight:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap">\n'
    '<link rel="stylesheet" '
    'href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&'
    'family=Inter+Tight:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap">'
)

ICONS = (
    '<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">\n'
    '<link rel="icon" type="image/x-icon" href="assets/favicon.ico">\n'
    '<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">\n'
    '<link rel="icon" type="image/png" sizes="192x192" href="assets/favicon-192.png">\n'
    '<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">\n'
    '<link rel="manifest" href="site.webmanifest">\n'
    '<meta name="theme-color" content="#05080F">\n'
    '<meta name="color-scheme" content="dark">'
)

BRAND_MARK = (
    '<img src="assets/brand/fluxmigrate-mark-ui.svg" alt="" width="34" height="30" '
    'decoding="async">'
)


def canonical_url(page):
    return SITE + "/" if page == "index.html" else SITE + "/" + page


def build_nav(page):
    links = []
    drawer = []
    for href, label in NAV_ITEMS:
        active = ' class="is-active" aria-current="page"' if href == page else ""
        links.append('<a href="%s"%s>%s</a>' % (href, active, label))
        dactive = ' is-active" aria-current="page' if href == page else ""
        drawer.append('<a class="drawer-link%s" href="%s">%s</a>' % (dactive, href, label))
    return (
        '<nav class="nav">\n'
        '  <div class="wrap">\n'
        '    <a class="brand" href="index.html" aria-label="FluxMigrate home">\n'
        '      %s\n'
        '      <span class="word">fluxmigrate<span>.com</span></span>\n'
        '    </a>\n'
        '    <div class="navlinks">%s</div>\n'
        '    <div class="navcta"><a class="btn btn-primary" href="contact.html">Talk to a Specialist</a></div>\n'
        '    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu">\n'
        '      <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>\n'
        '      <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>\n'
        '    </button>\n'
        '  </div>\n'
        '  <div class="nav-drawer" id="nav-drawer" data-open="false">\n'
        '    %s\n'
        '    <a class="btn btn-primary" href="contact.html">Talk to a Specialist</a>\n'
        '  </div>\n'
        '</nav>'
    ) % (BRAND_MARK, "\n".join(links), "\n    ".join(drawer))


NAV_SCRIPT = """<script>
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('data-open', String(open));
    document.body.setAttribute('data-nav-open', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1000) setOpen(false);
  });
})();
</script>"""

ORG_LD = """{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "%s/#organization",
  "name": "FluxMigrate",
  "url": "%s/",
  "logo": "%s/assets/logo-icon.png",
  "image": "%s/assets/og-image.png",
  "description": "FluxMigrate designs, migrates, automates and operates modern cloud and hybrid infrastructure, and provides Cloud, DevOps, Platform and SRE engineers to extend client teams.",
  "email": "info@fluxmigrate.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "info@fluxmigrate.com",
    "availableLanguage": ["English"]
  },
  "knowsAbout": [
    "Cloud migration", "AWS", "Microsoft Azure", "Google Cloud Platform",
    "Kubernetes", "OpenShift", "VMware", "OpenStack", "Terraform", "Ansible",
    "DevOps", "Platform engineering", "Site reliability engineering"
  ]
}""" % (SITE, SITE, SITE, SITE)


def build_jsonld(page, title, description):
    page_type, crumb, service = PAGE_SCHEMA[page]
    url = canonical_url(page)
    graph = []

    if page == "index.html":
        graph.append(ORG_LD)
        graph.append("""{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "%s/#website",
  "url": "%s/",
  "name": "FluxMigrate",
  "publisher": { "@id": "%s/#organization" }
}""" % (SITE, SITE, SITE))
    else:
        graph.append("""{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "%s/" },
    { "@type": "ListItem", "position": 2, "name": "%s", "item": "%s" }
  ]
}""" % (SITE, crumb, url))

        if service:
            graph.append("""{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "%s",
  "serviceType": "%s",
  "url": "%s",
  "description": "%s",
  "provider": { "@id": "%s/#organization" },
  "areaServed": "Worldwide"
}""" % (service, service, url, description, SITE))
        else:
            graph.append("""{
  "@context": "https://schema.org",
  "@type": "%s",
  "name": "%s",
  "url": "%s",
  "description": "%s",
  "isPartOf": { "@id": "%s/#website" },
  "about": { "@id": "%s/#organization" }
}""" % (page_type, crumb, url, description, SITE, SITE))

    return "\n".join(
        '<script type="application/ld+json">\n%s\n</script>' % block for block in graph
    )


CARD_ICONS = {
    "&#9729;": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.5 19a4.5 4.5 0 0 0 .3-9 6 6 0 0 0-11.5 1.6A3.7 3.7 0 0 0 7 19z"/></svg>',
    "&#9881;": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>',
    "&#128737;": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z"/><path d="m9.2 12 2 2 3.6-3.8"/></svg>',
}


def patch(page):
    path = os.path.join(ROOT, page)
    with open(path, encoding="utf-8") as fh:
        html = fh.read()

    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    description = re.search(
        r'<meta name="description" content="(.*?)">', html, re.S).group(1).strip()

    # --- head -------------------------------------------------------------
    # favicon block -> new icon set
    html = re.sub(
        r"<!-- Favicons -->.*?<link rel=\"apple-touch-icon\"[^>]*>",
        "<!-- Icons -->\n" + ICONS,
        html, flags=re.S)

    # fonts
    html = re.sub(
        r'<link rel="preconnect" href="https://fonts\.googleapis\.com">.*?'
        r'<link href="https://fonts\.googleapis\.com/css2[^>]*>',
        FONTS, html, flags=re.S)

    # inlined CSS -> shared stylesheet
    html = re.sub(r"<style>.*?</style>",
                  '<link rel="stylesheet" href="assets/site.css">',
                  html, flags=re.S)

    # canonical, right after the description
    if 'rel="canonical"' not in html:
        html = html.replace(
            '<meta name="description"',
            '<link rel="canonical" href="%s">\n<meta name="description"' % canonical_url(page),
            1)

    # og:url without the .html for the home page
    html = html.replace('content="%s/index.html"' % SITE, 'content="%s/"' % SITE)
    if 'property="og:site_name"' not in html:
        html = html.replace(
            '<meta property="og:type"',
            '<meta property="og:site_name" content="FluxMigrate">\n<meta property="og:type"', 1)
    if 'property="og:image:width"' not in html:
        html = html.replace(
            '<meta name="twitter:card"',
            '<meta property="og:image:width" content="1200">\n'
            '<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="FluxMigrate — cloud, DevOps, SRE and platform engineering">\n'
            '<meta name="twitter:card"', 1)

    # structured data, immediately before </head>
    html = re.sub(r'\n?<script type="application/ld\+json">.*?</script>', "", html, flags=re.S)
    html = html.replace("</head>", build_jsonld(page, title, description) + "\n\n</head>", 1)

    # --- body -------------------------------------------------------------
    # skip link
    if 'class="skip-link"' not in html:
        html = html.replace(
            "<body>",
            '<body>\n<a class="skip-link" href="#main">Skip to content</a>', 1)

    # nav
    html = re.sub(r'<nav class="nav">.*?</nav>', build_nav(page), html, flags=re.S)

    # <main> landmark around everything between the nav and the footer
    if '<main id="main">' not in html:
        html = html.replace("</nav>\n", "</nav>\n\n<main id=\"main\">\n", 1)
        html = html.replace("<footer>", "</main>\n\n<footer>", 1)

    # footer brand image
    html = re.sub(
        r'<img src="assets/logo-icon\.png" alt="FluxMigrate" style="height:28px;">',
        '<img src="assets/brand/fluxmigrate-mark-ui.svg" alt="" width="31" height="28" '
        'decoding="async" loading="lazy">',
        html)
    html = html.replace(
        '<a class="brand" href="index.html" style="margin-bottom:14px;">',
        '<a class="brand" href="index.html" aria-label="FluxMigrate home">')
    html = html.replace(
        '<p style="max-width:32ch;font-size:.88rem;">', '<p class="foot-about">')

    # leftover inline active-link colours are handled by .is-active now
    html = html.replace(' style="color:var(--text)"', "")

    # card glyphs -> inline SVG
    for glyph, svg in CARD_ICONS.items():
        html = html.replace('<div class="icon">%s</div>' % glyph,
                            '<div class="icon">%s</div>' % svg)

    # nav script, once, before </body>
    if "nav-toggle" in html and "var toggle = document.querySelector" not in html:
        html = html.replace("</body>", NAV_SCRIPT + "\n\n</body>", 1)

    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)
    return len(html)


if __name__ == "__main__":
    for p in PAGES:
        print("%-38s %6d bytes" % (p, patch(p)))
