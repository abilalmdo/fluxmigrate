// Helpers shared by the newsletter tests (check-subscribe.mjs).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function solve(q) {
  let m;
  if ((m = q.match(/^What is (\d+) plus (\d+)\?$/))) return String(+m[1] + +m[2]);
  if ((m = q.match(/^What is (\d+) minus (\d+)\?$/))) return String(+m[1] - +m[2]);
  if ((m = q.match(/^Which number is the largest: (\d+), (\d+) or (\d+)\?$/))) return String(Math.max(+m[1], +m[2], +m[3]));
  if ((m = q.match(/^Type the first three letters of the word "(\w+)"\.$/))) return m[1].slice(0, 3);
  if ((m = q.match(/^Type the last three letters of the word "(\w+)"\.$/))) return m[1].slice(-3);
  throw new Error(`cannot solve: ${q}`);
}

const DUMP_ROWS = '$d=new PDO("sqlite:/tmp/fm-data-test/subscribers.sqlite");echo json_encode($d->query("SELECT * FROM subscribers ORDER BY id")->fetchAll(PDO::FETCH_ASSOC));';

export function makeHelpers(base, sinkFile, container = "fm-php") {
  const sink = () => readFileSync(sinkFile, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const getChallenge = async () => (await fetch(`${base}/contact-captcha.php`)).json();
  const pool = [];
  const fillPool = async (n) => {
    for (let i = 0; i < n; i++) {
      const c = await getChallenge();
      pool.push({ captcha_token: c.token, captcha: solve(c.question) });
    }
    await sleep(3200); // an answer must be at least 3 s old
  };
  const form = (over = {}) => {
    const { interests, ...rest } = over;
    const params = new URLSearchParams({
      ts: String(Date.now() - 6000), hp_url: "", consent: "1", page: "/about.html",
      ...(pool.length ? pool.pop() : {}), email: "ada@example.com", ...rest,
    });
    for (const i of interests || []) params.append("interests[]", i);
    return params;
  };
  const post = (params, { json = true, origin = base } = {}) =>
    fetch(`${base}/subscribe.php`, {
      method: "POST",
      redirect: "manual",
      headers: { ...(json ? { Accept: "application/json" } : {}), ...(origin ? { Origin: origin } : {}), "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  const get = (path) => fetch(`${base}${path}`, { redirect: "manual" });
  // rows of the subscriber database, read with PHP inside the container (the file lives outside the web root)
  const rows = () => {
    try {
      return JSON.parse(execFileSync("docker", ["exec", container, "php", "-r", DUMP_ROWS], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }) || "[]");
    } catch {
      return []; // no database yet
    }
  };
  const sh = (cmd) => execFileSync("docker", ["exec", container, "sh", "-c", cmd], { encoding: "utf8" });
  return { sink, pool, fillPool, form, post, get, rows, sh, getChallenge };
}
