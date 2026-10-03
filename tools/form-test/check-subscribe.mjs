// Exercises the newsletter opt-in (public/subscribe*.php) against the PHP server, the fake SMTP sink and
// the SQLite file inside the container. Driven by run.sh.
//   node tools/form-test/check-subscribe.mjs <base-url> <sink-file> <phase>
//   phase "sub-main":  sign-up, double opt-in, confirm, unsubscribe, re-subscribe, validation
//   phase "sub-abuse": honeypot, script speed, foreign Origin, lockout
//   phase "sub-rate":  per-IP limit
import { makeHelpers } from "./lib.mjs";

const [base, sinkFile, phase = "sub-main"] = process.argv.slice(2);
let failures = 0;
const ok = (cond, msg, extra = "") => {
  if (cond) console.log(`PASS  ${msg}`);
  else { failures++; console.log(`FAIL  ${msg} ${extra}`); }
};
const { sink, fillPool, form, post, get, rows, sh } = makeHelpers(base, sinkFile);
const links = (mail) => ({
  confirm: mail.data.match(/subscribe-confirm\.php\?t=([a-f0-9]{32})/)?.[1],
  unsub: mail.data.match(/subscribe-unsubscribe\.php\?t=([a-f0-9]{32})/)?.[1],
});
const loc = (r) => r.headers.get("location");

if (phase === "sub-main") {
  await fillPool(24);
  let r = await get("/subscribe.php");
  ok(r.status === 405, "GET /subscribe.php -> 405 (PHP runs, source not served)");
  r = await fetch(`${base}/subscribe-confirm.php`, { method: "POST" });
  ok(r.status === 405, "POST to the confirm endpoint -> 405");

  // 1 - sign-up: pending row, one confirmation mail
  const before = sink().length;
  r = await post(form());
  let j = await r.json();
  ok(r.status === 200 && j.ok === true && j.redirect === "/subscription.html#pending", "valid sign-up -> ok, redirect to /subscription.html#pending", JSON.stringify(j));
  let mails = sink().slice(before);
  ok(mails.length === 2, "a sign-up sends two mails: a notice to the team and the confirmation", JSON.stringify(mails.map((m) => m.to)));
  ok(/info@fluxmigrate\.com/.test(mails[0].to.join()) && /New sign-up \(not yet confirmed\): ada@example\.com/.test(mails[0].data) && /Do not send newsletters to it until its status is 'confirmed'/.test(mails[0].data),
     "team notice arrives at sign-up, before any confirmation, and says the address is unconfirmed");
  ok(/ada@example\.com/.test(mails[1].to.join()) && /Confirm your FluxMigrate subscription/.test(mails[1].data), "confirmation mail is addressed to the visitor");
  mails = [mails[1]]; // the rest of this block looks at the confirmation
  const lk = links(mails[0]);
  ok(!!lk.confirm && !!lk.unsub, "mail carries a confirm link and an unsubscribe link");
  ok(/http:\/\/127\.0\.0\.1:8089\/subscribe-confirm\.php/.test(mails[0].data), "links use the configured site URL (not the request's Host)");
  ok(/You will receive: Blog posts, Newsletter, Service updates/.test(mails[0].data), "mail says what the subscriber will receive");
  let db = rows();
  ok(db.length === 1 && db[0].status === "pending" && db[0].email === "ada@example.com" && db[0].interests === "blog,newsletter,updates", "row stored as pending, subscribed to all three kinds", JSON.stringify(db));
  ok(db[0].consent_text === "I agree to receive emails from FluxMigrate: blog posts, the newsletter and service updates. I can unsubscribe at any time." && db[0].source_page === "/about.html" && db[0].ip_hash.length === 24, "consent wording, page and hashed IP are recorded");
  ok(!/127\.0\.0\.1/.test(db[0].ip_hash), "the raw IP is not stored");
  ok(sh('find /site -name "*.sqlite*" | wc -l').trim() === "0", "no database file inside the web root");
  ok(sh("stat -c %a /tmp/fm-data-test/subscribers.sqlite").trim() === "600", "database file is private (0600)");

  // 2 - same address again while pending: thanked, not mailed again
  r = await post(form());
  j = await r.json();
  ok(j.ok === true && sink().length === before + 2 && rows().length === 1, "same address again within a day: looks successful, no second mail, no second row");
  r = await post(form({ email: "ADA@Example.com" }));
  ok((await r.json()).ok === true && rows().length === 1, "same address in other case does not create a second row");

  // 3 - confirm
  r = await get(`/subscribe-confirm.php?t=${lk.confirm}`);
  ok(r.status === 303 && loc(r) === "/subscription.html#confirmed", "confirm link -> 303 /subscription.html#confirmed", `${r.status} ${loc(r)}`);
  db = rows();
  ok(db[0].status === "confirmed" && !!db[0].confirmed_at, "row is confirmed with a timestamp");
  mails = sink().slice(before);
  ok(mails.length === 3 && /info@fluxmigrate\.com/.test(mails[2].to.join()) && /New subscriber: ada@example\.com/.test(mails[2].data) && /Subscribed to: Blog posts, Newsletter, Service updates/.test(mails[2].data), "team inbox gets a notice with the address and what they subscribed to");
  r = await get(`/subscribe-confirm.php?t=${lk.confirm}`);
  ok(loc(r) === "/subscription.html#confirmed" && sink().length === before + 3, "clicking the link twice is harmless and sends no second notice");

  // 4 - already confirmed: sign-up again says nothing new and mails nothing
  r = await post(form());
  ok((await r.json()).ok === true && sink().length === before + 3, "sign-up for a confirmed address: looks the same, sends nothing (no way to probe the list)");

  // 5 - bad links
  for (const t of ["zz", "", "../../etc/passwd", "0".repeat(32), "a".repeat(33)]) {
    r = await get(`/subscribe-confirm.php?t=${encodeURIComponent(t)}`);
    ok(loc(r) === "/subscription.html#invalid", `confirm with token ${JSON.stringify(t.slice(0, 12))} -> #invalid`);
  }
  r = await get(`/subscribe-unsubscribe.php?t=${"f".repeat(32)}`);
  ok(loc(r) === "/subscription.html#invalid", "unsubscribe with an unknown token -> #invalid");
  ok(rows()[0].status === "confirmed", "bad links changed nothing");

  // 6 - unsubscribe, and the old confirm link stops working
  r = await get(`/subscribe-unsubscribe.php?t=${lk.unsub}`);
  ok(r.status === 303 && loc(r) === "/subscription.html#unsubscribed", "unsubscribe link -> #unsubscribed");
  ok(rows()[0].status === "unsubscribed" && !!rows()[0].unsubscribed_at && rows().length === 1, "row kept, marked unsubscribed");
  r = await get(`/subscribe-confirm.php?t=${lk.confirm}`);
  ok(loc(r) === "/subscription.html#invalid" && rows()[0].status === "unsubscribed", "an old confirm link cannot revive an unsubscribed address");
  r = await fetch(`${base}/subscribe-unsubscribe.php`, { method: "POST", redirect: "manual", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `t=${lk.unsub}` });
  ok(r.status === 303 && loc(r) === "/subscription.html#unsubscribed", "one-click POST unsubscribe works too");

  // 7 - coming back: pending again, new tokens, new mail
  const b7 = sink().length;
  r = await post(form());
  ok((await r.json()).ok === true && sink().length === b7 + 2, "re-subscribing after unsubscribe sends a notice and a fresh confirmation");
  const lk2 = links(sink()[b7 + 1]);
  db = rows();
  ok(db.length === 1 && db[0].status === "pending" && lk2.confirm !== lk.confirm && lk2.unsub !== lk.unsub, "same row reused, pending, new tokens");
  r = await get(`/subscribe-confirm.php?t=${lk.confirm}`);
  ok(loc(r) === "/subscription.html#invalid", "the previous confirm token no longer works");

  // 8 - validation. Nothing here may store a row or send a mail. (The five sign-ups above used this
  // client's hourly allowance, so clear that counter; the limit itself is tested in phase sub-rate.)
  sh("rm -f /tmp/fm-form-sub-ip-*");
  const b8 = sink().length, n8 = rows().length;
  for (const [label, over, status, code] of [
    ["bad email", { email: "not-an-email" }, 422, "invalid"],
    ["empty email", { email: "" }, 422, "invalid"],
    ["CRLF in email", { email: "a@example.com\r\nBcc: victim@example.net" }, 422, "invalid"],
    ["no consent", { consent: "" }, 422, "consent"],
  ]) {
    const p = form(over);
    if (label === "no consent") p.delete("consent");
    r = await post(p);
    j = await r.json();
    ok(r.status === status && j.code === code && sink().length === b8 && rows().length === n8, `${label} -> ${status} code=${code}, nothing stored or sent`);
  }
  const noCaptcha = form();
  noCaptcha.set("captcha_token", "");
  noCaptcha.set("captcha", "");
  r = await post(noCaptcha);
  j = await r.json();
  ok(r.status === 422 && j.code === "captcha" && rows().length === n8, "no captcha token -> 422 code=captcha");
  r = await post(form({ email: "plain@example.com" }), { json: false });
  ok(r.status === 303 && loc(r) === "/subscription.html#pending", "plain browser post (no JS) -> 303 /subscription.html#pending", `${r.status} ${loc(r)}`);
  r = await post(form({ email: "x" }), { json: false });
  ok(r.status === 303 && loc(r) === "/subscription.html#error", "plain post with bad input -> 303 /subscription.html#error", `${r.status} ${loc(r)}`);

  // 9 - hostile input is stored as data, never executed
  const evil = "o'brien\"; DROP TABLE subscribers;--@example.com";
  r = await post(form({ email: evil }));
  j = await r.json();
  const stored = rows();
  if (j.ok) {
    const row = stored.find((x) => x.email === evil);
    ok(!!row, "odd characters in the email are stored literally");
  } else {
    ok(j.code === "invalid" && stored.length >= 1, "an address with quotes and SQL is refused as invalid; the table is intact");
  }
  // posted interests are ignored: the server decides
  const forced = new URLSearchParams(form({ email: "forced@example.com" }));
  forced.append("interests[]", "evil");
  r = await post(forced);
  ok((await r.json()).ok === true && rows().find((x) => x.email === "forced@example.com")?.interests === "blog,newsletter,updates", "posted interests are ignored: always all three");
  r = await post(form({ email: "x".repeat(250) + "@example.com" }));
  ok(r.status === 422, "over-long email -> 422");
}

if (phase === "sub-abuse") {
  await fillPool(6);
  const before = sink().length;
  let r = await post(form({ email: "bot1@example.com", hp_url: "http://spam.example" }));
  ok((await r.json()).ok === true && sink().length === before && rows().length === 0, "filled honeypot: looks successful, stores nothing, mails nothing (strike 1)");
  r = await post(form({ email: "bot2@example.com", ts: String(Date.now() - 300) }));
  ok((await r.json()).ok === true && sink().length === before && rows().length === 0, "form 'filled' in 0.3 s: same (strike 2)");
  r = await post(form({ email: "bot3@example.com" }), { origin: "https://evil.example" });
  ok(r.status === 403 && sink().length === before, "foreign Origin -> 403 (strike 3)");
  r = await post(form({ email: "good@example.com" }));
  const j = await r.json();
  ok(r.status === 429 && j.code === "rate" && sink().length === before && rows().length === 0, "locked out: a clean sign-up gets 429 and stores nothing");
}

if (phase === "sub-rate") {
  await fillPool(8);
  for (let i = 1; i <= 5; i++) {
    const r = await post(form({ email: `person${i}@example.com` }));
    ok((await r.json()).ok === true, `sign-up ${i} of 5 from one IP is accepted`);
  }
  const r = await post(form({ email: "person6@example.com" }));
  const j = await r.json();
  ok(r.status === 429 && j.code === "rate" && rows().length === 5, "6th sign-up from the same IP is refused with 429", `${r.status} ${JSON.stringify(j)}`);
}

console.log(failures ? `\n${failures} check(s) failed` : "\nall subscribe checks passed");
process.exit(failures ? 1 : 0);
