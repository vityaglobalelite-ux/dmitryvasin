import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = fs.readFileSync(path.join(root, "src/lib/landing-data.ts"), "utf8");
const byTitle = {};
const re =
  /\{\s*id:\s*\d+,[\s\S]*?title:\s*"([^"]+)"[\s\S]*?body:\s*"((?:\\.|[^"\\])*)"/g;
let match;
while ((match = re.exec(src))) {
  if (!byTitle[match[1]]) {
    byTitle[match[1]] = match[2].replace(/\\"/g, '"');
  }
}
const out = path.join(root, "scripts/catalog-landing-bodies.json");
fs.writeFileSync(out, JSON.stringify(byTitle, null, 2), "utf8");
console.log(`Wrote ${Object.keys(byTitle).length} lesson bodies → ${out}`);
