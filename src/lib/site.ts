import config from "@/config/config.json";

/** Canonical public URL for a request path. Pages are served as <slug>.html (build.format = "file"). */
export function canonicalFor(pathname: string): string {
  let p = pathname.replace(/index\.html$/, "").replace(/\.html$/, "").replace(/\/+$/, "");
  if (p === "" || p === "/") return `${config.site.base_url}/`;
  return `${config.site.base_url}${p}.html`;
}

/** Absolute URL for an asset path. */
export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${config.site.base_url}${path}`;
}

const ORG_ID = `${config.site.base_url}/#organization`;
const SITE_ID = `${config.site.base_url}/#website`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: config.site.title,
  url: `${config.site.base_url}/`,
  logo: absolute("/apple-touch-icon.png"),
  image: absolute(config.metadata.meta_image),
  description:
    "FluxMigrate designs, migrates, automates and operates modern cloud and hybrid infrastructure, and provides Cloud, DevOps, Platform and SRE engineers to extend client teams.",
  email: config.params.footer_email,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: config.params.footer_email,
    availableLanguage: ["English"],
  },
  knowsAbout: [
    "Cloud migration", "AWS", "Microsoft Azure", "Google Cloud Platform", "Kubernetes",
    "OpenShift", "VMware", "OpenStack", "Terraform", "Ansible", "DevOps",
    "Platform engineering", "Site reliability engineering",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${config.site.base_url}/`,
  name: config.site.title,
  publisher: { "@id": ORG_ID },
};

export function breadcrumbSchema(label: string, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${config.site.base_url}/` },
      { "@type": "ListItem", position: 2, name: label, item: canonical },
    ],
  };
}

export function serviceSchema(name: string, canonical: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    url: canonical,
    description,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
  };
}

export function pageSchema(type: string, name: string, canonical: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    url: canonical,
    description,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
  };
}
