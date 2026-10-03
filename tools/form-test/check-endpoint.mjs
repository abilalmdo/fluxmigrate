// Exercises public/contact-submit.php against a running PHP server and the fake SMTP sink.
// Driven by tools/form-test/run.sh — see that file. Exits non-zero on any failed check.
//   node tools/form-test/check-endpoint.mjs <base-url> <sink-file> <phase>
//   phase "main": delivery, validation, captcha, duplicates, rate limit (reachable SMTP server)
//   phase "abuse": honeypot, script speed and foreign Origin each count a strike; three lock the client out
//   phase "forge": malformed and forged captcha tokens are refused
//   phase "spam": links, markup and spam words are refused with a strike
//   phase "challenge": captcha question limit, script-speed answers, oversize bodies
//   phase "smtp-down": the SMTP server is gone; the endpoint must fail cleanly, not hang or leak
// run.sh clears the temp-dir counters between phases.
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function solve(q) {
  let m;
  if ((m = q.match(/^What is (\d+) plus (\d+)\?$/))) return String(+m[1] + +m[2]);
  if ((m = q.match(/^What is (\d+) minus (\d+)\?$/))) return String(+m[1] - +m[2]);
  if ((m = q.match(/^Which number is the largest: (\d+), (\d+) or (\d+)\?$/))) return String(Math.max(+m[1], +m[2], +m[3]));
  if ((m = q.match(/^Type the first three letters of the word "(\w+)"\.$/))) return m[1].slice(0, 3);
  if ((m = q.match(/^Type the last three letters of the word "(\w+)"\.$/))) return m[1].slice(-3);
  throw new Error(`cannot solve: ${q}`);
}
const getChallenge = async () => (await fetch(`${base}/contact-captcha.php`)).json();
// A solved challenge, ready to post: { captcha_token, captcha }
const solved = async () => { const c = await getChallenge(); return { captcha_token: c.token, captcha: solve(c.question) }; };
// Challenges must age past the 3 s minimum, so fetch a batch, wait once, then draw from it.
const pool = [];
async function fillPool(n) {
  for (let i = 0; i < n; i++) pool.push(await solved());
  await sleep(3200);
}
const valid = (over = {}) => ({
  ts: ago(6000), hp_url: "", ...(pool.length ? pool.pop() : {}), name: "Ada Lovelace", company: "Analytical Engines Ltd", email: "ada@example.com",
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
  await fillPool(26);
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

  // 5b - captcha. Missing token: refused, no strike (a visitor without JavaScript lands here).
  const b3 = sink().length;
  r = await post({ ...valid(), captcha_token: "", captcha: "" });
  j = await r.json();
  ok(r.status === 422 && j.code === "captcha" && sink().length === b3, "no captcha token -> 422 code=captcha, nothing sent");
  // wrong answer: refused, and the token is spent so the right answer no longer works with it
  const one = pool.pop();
  r = await post({ ...valid(), ...one, captcha: "zzzz" });
  j = await r.json();
  ok(r.status === 422 && j.code === "captcha" && /not right/.test(j.message), "wrong captcha answer -> 422 code=captcha");
  r = await post({ ...valid(), ...one });
  j = await r.json();
  ok(r.status === 422 && j.code === "captcha" && sink().length === b3, "the same token cannot be reused, even with the right answer");
  // a number can be typed as digits or as a word
  // (pick a pooled challenge whose answer is 0-10, which has a word form, without using up the others)
  const wordSet = Object.entries(WORDS);
  const hasWord = (c) => wordSet.some(([, n]) => String(n) === c.captcha);
  let item = pool.find(hasWord);
  if (item) pool.splice(pool.indexOf(item), 1);
  for (let i = 0; i < 3 && !item; i++) {
    // none in the pool (about a 1-in-15 draw): fetch a few more, then let them age past the 3 s minimum
    const c = await getChallenge();
    const cand = { captcha_token: c.token, captcha: solve(c.question) };
    if (hasWord(cand)) { item = cand; await sleep(3200); }
  }
  if (!item) throw new Error("no challenge with a word-form answer found");
  const wordAns = wordSet.find(([, n]) => String(n) === item.captcha)[0];
  r = await post({ ...valid({ name: "Word Answer" }), ...item, captcha: ` ${wordAns.toUpperCase()}. ` });
  ok((await r.json()).ok === true, `answer "${wordAns}" (word, upper case, padded) is accepted`);

  // 5c - the same enquiry again within a day (here: test 1's, with other case and spacing): thanked, not sent twice
  const dupBefore = sink().length;
  r = await post(valid());
  ok((await r.json()).ok === true && sink().length === dupBefore, "identical enquiry looks successful, is not sent again");
  r = await post(valid({ details: "  LINE one.\nline TWO — with a dash and ünïcode.  " }));
  ok((await r.json()).ok === true && sink().length === dupBefore, "same enquiry with other case and spacing is not sent again either");

  // fill the hourly allowance (5 per IP) with distinct messages, then the next one is refused
  let sent = sink().length;
  let guard = 0;
  while (sent < 5 && guard++ < 10) {
    r = await post(valid({ name: `Filler ${guard}` }));
    if ((await r.json()).ok === true) sent = sink().length;
  }
  ok(sink().length === 5, "5 sends from one IP within the hour are accepted", `got ${sink().length}`);
  r = await post(valid({ name: "Over the limit" }));
  j = await r.json();
  ok(r.status === 429 && j.ok === false && /Too many/.test(j.message), "6th send from the same IP is refused with 429");
}

if (phase === "abuse") {
  await fillPool(8);
  const before = sink().length;
  let r = await post(valid({ hp_url: "http://spam.example" }));
  let j = await r.json();
  ok(j.ok === true && sink().length === before, "filled honeypot: looks successful, sends nothing (strike 1)");
  r = await post(valid({ ts: ago(300) }));
  j = await r.json();
  ok(j.ok === true && sink().length === before, "form 'filled' in 0.3 s: looks successful, sends nothing (strike 2)");
  r = await post(valid(), { origin: "https://evil.example" });
  ok(r.status === 403 && sink().length === before, "foreign Origin is refused with 403 (strike 3)");
  // three strikes: the client is locked out of both endpoints
  r = await post(valid());
  j = await r.json();
  ok(r.status === 429 && j.code === "rate" && sink().length === before, "locked out after three strikes: a perfectly valid post gets 429");
  r = await fetch(`${base}/contact-captcha.php`);
  ok(r.status === 429, "locked out: no new captcha questions either");
  r = await post(valid(), { json: false });
  ok(r.status === 303 && /error=rate/.test(r.headers.get("location") || ""), "locked out, plain post: 303 back to the form with error=rate");
}

if (phase === "forge") {
  await fillPool(4);
  let r;
  const b = sink().length;
  r = await post({ ...valid(), captcha_token: "a".repeat(16) + ".1.0000", captcha: "1" });
  ok(r.status === 422 && sink().length === b, "malformed token -> 422");
  // forged token: valid shape, signature made up
  r = await post({ ...valid(), captcha_token: `${"ab".repeat(8)}.${Math.floor(Date.now() / 1000) - 10}.${"cd".repeat(32)}`, captcha: "7" });
  ok(r.status === 422 && sink().length === b, "forged token -> 422");
}

if (phase === "spam") {
  await fillPool(8);
  const before = sink().length;
  let r = await post(valid({ name: "Link Fan", details: "See https://a.example and https://b.example for the diagram." }));
  ok((await r.json()).ok === true && sink().length === before + 1, "two links in the message are allowed");
  r = await post(valid({ name: "Visit www.cheap-seo.example" }));
  let j = await r.json();
  ok(r.status === 422 && j.code === "spam" && sink().length === before + 1, "a link in the name field is refused (strike 1)");
  r = await post(valid({ name: "Spammer", details: "http://a.example http://b.example http://c.example" }));
  j = await r.json();
  ok(r.status === 422 && j.code === "spam", "three links in the message are refused (strike 2)");
  r = await post(valid({ name: "Markup", details: 'Hello <a href="http://x.example">click</a>' }));
  j = await r.json();
  ok(r.status === 422 && j.code === "spam" && sink().length === before + 1, "an HTML link in the message is refused (strike 3)");
  r = await post(valid({ name: "Locked", details: "Cheap casino backlinks" }));
  ok(r.status === 429 && sink().length === before + 1, "three strikes lock the client out");
}

if (phase === "challenge") {
  await fillPool(1);
  let r = await post(valid({ details: "x" }), { json: true });
  let j = await r.json();
  ok(r.status === 200 || r.status === 422, "sanity: endpoint answers");
  // an enormous body is refused outright
  r = await fetch(`${base}/contact-submit.php`, {
    method: "POST",
    headers: { Accept: "application/json", Origin: ORIGIN, "Content-Type": "application/x-www-form-urlencoded" },
    body: "details=" + "a".repeat(70000),
  });
  ok(r.status === 413, "a 70 KB body is refused with 413", String(r.status));
  // answering faster than a person can read: looks successful, sends nothing
  const before = sink().length;
  const fresh = await solved();
  r = await post({ ...valid(), ...fresh, name: "Too Quick" });
  j = await r.json();
  ok(j.ok === true && sink().length === before, "captcha answered within 3 s: looks successful, sends nothing");
  // captcha questions are rate limited per client
  const q = await getChallenge();
  ok(typeof q.question === "string" && /^[a-f0-9]{16}\.\d+\.[a-f0-9]{64}$/.test(q.token), "a question comes with a signed token");
  r = await fetch(`${base}/contact-captcha.php`, { method: "POST" });
  ok(r.status === 405, "captcha endpoint accepts GET only");
  let last = 0;
  for (let i = 0; i < 40 && last !== 429; i++) last = (await fetch(`${base}/contact-captcha.php`)).status;
  ok(last === 429, "captcha questions are rate limited (30 per hour per client)");
}

if (phase === "smtp-down") {
  await fillPool(1);
  const t0 = Date.now();
  const r = await post(valid());
  const j = await r.json();
  ok(r.status === 502 && j.ok === false && /couldn't send/.test(j.message), "SMTP unreachable and no local mail(): clean 502 with a human message", `${r.status} ${JSON.stringify(j)}`);
  ok(Date.now() - t0 < 30000, "fails fast (no hang)", `${Date.now() - t0} ms`);
  ok(!JSON.stringify(j).includes("ss$w"), "response never contains the password");
}

console.log(failures ? `\n${failures} check(s) failed` : "\nall endpoint checks passed");
process.exit(failures ? 1 : 0);
