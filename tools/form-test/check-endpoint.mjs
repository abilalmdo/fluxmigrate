// Exercises public/contact-submit.php against a running PHP server and the fake SMTP sink.
// Driven by tools/form-test/run.sh — see that file. Exits non-zero on any failed check.
//   node tools/form-test/check-endpoint.mjs <base-url> <sink-file> <phase>
//   phase "main": all behaviour with a reachable SMTP server
//   phase "smtp-down": the SMTP server is gone; the endpoint must fail cleanly, not hang or leak
import { readFileSync } from "node:fs";

const [base, sinkFile, phase = "main"] = process.argv.slice(2);
const ORIGIN = base;
let failures = 0;
const ok = (cond, msg, extra = "") => {
  if (cond) console.log(`PASS  ${msg}`);
  else { failures++; console.log(`FAIL  ${msg} ${extra}`); }
};
const sink = () => readFileSync(sinkFile, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
const ago = (ms) => String(Date.now() - ms);

const valid = (over = {}) => ({
  ts: ago(6000), hp_url: "", name: "Ada Lovelace", company: "Analytical Engines Ltd", email: "ada@example.com",
  role: "CTO", need: "Cloud Migration", env: "AWS, Kubernetes", count: "2–3", engagement: "Project",
  details: "Line one.\nLine two — with a dash and ünïcode.", ...over,
});
const post = (fields, { json = true, origin = ORIGIN } = {}) =>
  fetch(`${base}/contact-submit.php`, {
    method: "POST",
    redirect: "manual",
    headers: { ...(json ? { Accept: "application/json" } : {}), ...(origin ? { Origin: origin } : {}), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });

if (phase === "main") {
  const password = `p"a'ss$w\\ord;<?php echo 1; ?>`;

  let r = await fetch(`${base}/contact-submit.php`);
  ok(r.status === 405 && r.headers.get("allow") === "POST", "GET is refused with 405 (PHP is executing, source not served)");

  // 1 - valid JSON post
  r = await post(valid());
  let j = await r.json();
  ok(r.status === 200 && j.ok === true && j.redirect === "/thank-you.html", "valid post -> ok + redirect to /thank-you.html", JSON.stringify(j));
  let mails = sink();
  ok(mails.length === 1, "exactly one mail reached the SMTP server", `got ${mails.length}`);
  const m = mails[0];
  ok(m?.auth?.user === "forms@fluxmigrate.com" && m?.auth?.password === password, "SMTP auth used the configured user and the exact password (quotes, $, backslash, <?php survive)");
  ok(m?.to.length === 1 && /info@fluxmigrate\.com/.test(m.to[0]), "recipient is info@fluxmigrate.com", JSON.stringify(m?.to));
  ok(/^From: .*forms@fluxmigrate\.com/m.test(m?.data), "From is the sender mailbox");
  ok(/^Reply-To: .*ada@example\.com/m.test(m?.data), "Reply-To is the visitor");
  ok(/^Subject: New inquiry from fluxmigrate\.com: Analytical Engines Ltd \(Ada Lovelace\)/m.test(m?.data), "subject names company and person");
  ok(/Technology environment: AWS, Kubernetes/.test(m?.data) && /Line two/.test(m?.data), "body carries every field", "");

  // 2 - plain browser post (no JS): 303 to the thank-you page
  r = await post(valid({ name: "No Script" }), { json: false });
  ok(r.status === 303 && r.headers.get("location") === "/thank-you.html", "plain post -> 303 /thank-you.html", `${r.status} ${r.headers.get("location")}`);

  // 3 - header injection through name and email
  r = await post(valid({ name: "Eve\r\nBcc: victim@example.net", company: "X\nCc: v2@example.net" }));
  j = await r.json();
  mails = sink();
  const inj = mails[mails.length - 1];
  ok(j.ok === true && !/^(Bcc|Cc):/im.test(inj.data.split("\n\n")[0]) && inj.to.length === 1, "CRLF in name/company cannot add headers or recipients", inj.data.split("\n\n")[0]);
  r = await post(valid({ email: "a@example.com\r\nBcc: victim@example.net" }));
  j = await r.json();
  ok(r.status === 422 && j.ok === false, "CRLF in email is refused", `${r.status}`);

  // 4 - things that must not send
  const before = sink().length;
  r = await post(valid({ hp_url: "http://spam.example" }));
  j = await r.json();
  ok(j.ok === true && sink().length === before, "filled honeypot: looks successful, sends nothing");
  r = await post(valid({ ts: ago(300) }));
  j = await r.json();
  ok(j.ok === true && sink().length === before, "form 'filled' in 0.3 s: looks successful, sends nothing");
  r = await post(valid(), { origin: "https://evil.example" });
  ok(r.status === 403 && sink().length === before, "foreign Origin is refused with 403");
  for (const [k, v] of [["name", ""], ["company", " "], ["email", "not-an-email"], ["email", ""]]) {
    r = await post(valid({ [k]: v }));
    j = await r.json();
    ok(r.status === 422 && j.ok === false && /name, company and a valid email/.test(j.message), `invalid ${k}=${JSON.stringify(v)} -> 422 with message`);
  }
  r = await post(valid({ details: "x".repeat(5001) }));
  ok(r.status === 422, "over-long message -> 422");
  r = await post(valid({ name: "n".repeat(101) }));
  ok(r.status === 422, "over-long name -> 422");
  r = await post({ ...valid(), email: "bad" }, { json: false });
  ok(sink().length === before, "validation failures sent nothing");
  ok(r.status === 303 && r.headers.get("location") === "/contact.html?error=invalid#form-status", "plain post with bad input -> 303 back to /contact.html?error=invalid#form-status", r.headers.get("location"));

  // 5 - unicode and a missing timestamp (no-JS visitor) still send
  const b2 = sink().length;
  r = await post(valid({ ts: "", name: "Zoë Müller", company: "Ünïcode GmbH — 日本", details: "" }));
  j = await r.json();
  const u = sink()[b2];
  ok(j.ok === true && u && /Requirements:\n\(none given\)/.test(u.data), "no timestamp (JS off) and empty message still send");
  ok(u && /=\?UTF-8\?/.test(u.data) || u && /Content-Transfer-Encoding/.test(u.data), "non-ASCII name/company are encoded, not raw in headers");

  // 6 - rate limit: 5 real sends so far from this IP (tests 1, 2, 3, 5 + one more), the next is refused
  r = await post(valid({ name: "Fifth" }));
  ok((await r.json()).ok === true, "5th valid send from one IP within the hour is accepted");
  r = await post(valid({ name: "Sixth" }));
  j = await r.json();
  ok(r.status === 429 && j.ok === false && /Too many/.test(j.message), "6th send from the same IP is refused with 429");
}

if (phase === "smtp-down") {
  const t0 = Date.now();
  const r = await post(valid());
  const j = await r.json();
  ok(r.status === 502 && j.ok === false && /couldn't send/.test(j.message), "SMTP unreachable and no local mail(): clean 502 with a human message", `${r.status} ${JSON.stringify(j)}`);
  ok(Date.now() - t0 < 30000, "fails fast (no hang)", `${Date.now() - t0} ms`);
  ok(!JSON.stringify(j).includes("ss$w"), "response never contains the password");
}

console.log(failures ? `\n${failures} check(s) failed` : "\nall endpoint checks passed");
process.exit(failures ? 1 : 0);
