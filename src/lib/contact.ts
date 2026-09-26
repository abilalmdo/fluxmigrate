import config from "@/config/config.json";

/** Phone and offices live in src/config/config.json (params.phone, params.offices). */
export const phone = config.params.phone;
export const offices = config.params.offices;

export type Office = (typeof offices)[number];

/** One-line street address (for structured data). */
export const streetOf = (o: Office): string => o.street_lines.join(", ");

/** Printable address lines: street line(s) / "City, ST ZIP" / country. */
export function officeLines(o: Office): string[] {
  const cityLine = [o.locality, [o.region, o.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [...o.street_lines, cityLine, o.country_name].filter(Boolean);
}

export const telHref = `tel:${phone.tel}`;
