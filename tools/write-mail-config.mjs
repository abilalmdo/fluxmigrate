// Writes dist/mail-config.php from environment variables (GitHub Actions secrets in CI).
// Run after `pnpm build` and `verify-dist`, before the FTP sync:
//   SMTP_HOST=... SMTP_USER=... SMTP_PASSWORD=... node tools/write-mail-config.mjs
//
// The credentials are never committed. The generated file is a PHP file that returns an array, so a
// server that fails to run PHP still cannot show the values as text, and public/.htaccess refuses
// the URL anyway. The payload is base64 only so no password character can break PHP quoting.
// A random comment makes the file's content hash unguessable: the FTP action records that hash in a
// sync-state file, and without the nonce a weak password could be brute-forced against it.
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = process.env.DIST_DIR || join(import.meta.dirname, "..", "dist"); // DIST_DIR: tests only
const env = process.env;

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"].filter((k) => !env[k]);
if (missing.length) {
  console.error(`write-mail-config: missing ${missing.join(", ")}. Add them as GitHub Actions secrets.`);
  process.exit(1);
}
if (!existsSync(dist)) {
  console.error("write-mail-config: dist/ does not exist. Run `pnpm build` first.");
  process.exit(1);
}

const config = {
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 465),
  secure: env.SMTP_SECURE || "ssl", // ssl (port 465) | tls (STARTTLS, 587)
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
  from: env.MAIL_FROM || env.SMTP_USER,
  to: env.MAIL_TO || "info@fluxmigrate.com",
};
if (env.SITE_URL) config.site_url = env.SITE_URL; // links in newsletter mails; default https://www.fluxmigrate.com
if (env.DATA_DIR) config.data_dir = env.DATA_DIR; // newsletter database folder; default: "fm-data" beside the web root
if (env.ALLOWED_HOSTS) config.allowed_hosts = env.ALLOWED_HOSTS.split(",").map((h) => h.trim().toLowerCase());

const payload = Buffer.from(JSON.stringify(config)).toString("base64");
writeFileSync(
  join(dist, "mail-config.php"),
  `<?php\n// Generated at deploy time from CI secrets. Do not edit or commit.\n// build ${randomBytes(16).toString("hex")}\nreturn json_decode(base64_decode('${payload}'), true);\n`,
);
console.log(`write-mail-config: wrote ${join(dist, "mail-config.php")} for ${config.user} via ${config.host}:${config.port} (${config.secure})`);
