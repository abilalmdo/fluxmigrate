// Prints the enquiries the preview's fake SMTP server has kept (newest last), as they would arrive.
//   wsl -e bash -lc "cd /mnt/d/FluxMigrate/fluxmigrate && node tools/form-test/show-mail.mjs"
import { existsSync, readFileSync } from "node:fs";

const file = process.argv[2] || "/tmp/smtp-sink.jsonl";
const mails = existsSync(file)
  ? readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];
if (!mails.length) console.log("No enquiries yet. Submit the form at http://localhost:8088/contact.html");
mails.forEach((m, i) => {
  console.log(`===== message ${i + 1} of ${mails.length} · envelope from ${m.from} to ${m.to.join(", ")} =====`);
  console.log(m.data);
});
