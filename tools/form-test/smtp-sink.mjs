// Minimal fake SMTP server for testing public/contact-submit.php. No TLS, no relaying: it accepts
// AUTH LOGIN / PLAIN, records every message as JSON lines and answers like a normal server.
//   node tools/form-test/smtp-sink.mjs [port=2525] [outfile=/tmp/smtp-sink.jsonl]
// Test tooling only: never deployed (tools/ is not part of dist/).
import { createServer } from "node:net";
import { appendFileSync, writeFileSync } from "node:fs";

const port = Number(process.argv[2] || 2525);
const out = process.argv[3] || "/tmp/smtp-sink.jsonl";
writeFileSync(out, "");

createServer((sock) => {
  let buf = "";
  let inData = false;
  let auth = null;
  let step = null; // AUTH LOGIN state
  const msg = { from: null, to: [], auth: null, data: "" };
  const send = (l) => sock.write(l + "\r\n");
  send("220 sink ESMTP");
  sock.on("data", (chunk) => {
    buf += chunk.toString("utf8");
    let i;
    while ((i = buf.indexOf("\r\n")) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 2);
      if (inData) {
        if (line === ".") {
          inData = false;
          appendFileSync(out, JSON.stringify({ ...msg, auth }) + "\n");
          send("250 queued");
        } else msg.data += (line.startsWith("..") ? line.slice(1) : line) + "\n";
        continue;
      }
      if (step === "user") { auth = { user: Buffer.from(line, "base64").toString() }; step = "pass"; send("334 UGFzc3dvcmQ6"); continue; }
      if (step === "pass") { auth.password = Buffer.from(line, "base64").toString(); step = null; send("235 ok"); continue; }
      const cmd = line.toUpperCase();
      if (cmd.startsWith("EHLO") || cmd.startsWith("HELO")) { sock.write("250-sink\r\n250 AUTH LOGIN PLAIN\r\n"); }
      else if (cmd === "AUTH LOGIN") { step = "user"; send("334 VXNlcm5hbWU6"); }
      else if (cmd.startsWith("AUTH PLAIN")) { const [, u, p] = Buffer.from(line.split(" ")[2] || "", "base64").toString().split("\0"); auth = { user: u, password: p }; send("235 ok"); }
      else if (cmd.startsWith("MAIL FROM")) { msg.from = line.slice(10).trim(); send("250 ok"); }
      else if (cmd.startsWith("RCPT TO")) { msg.to.push(line.slice(8).trim()); send("250 ok"); }
      else if (cmd === "DATA") { inData = true; msg.data = ""; send("354 go"); }
      else if (cmd === "RSET") { msg.to = []; send("250 ok"); }
      else if (cmd === "QUIT") { send("221 bye"); sock.end(); }
      else send("250 ok");
    }
  });
  sock.on("error", () => {});
}).listen(port, "127.0.0.1", () => console.log(`smtp sink on ${port}, writing ${out}`));
