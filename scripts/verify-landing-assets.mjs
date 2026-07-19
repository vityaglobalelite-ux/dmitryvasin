import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync("src/lib/landing-assets.ts", "utf8");
const names = [
  ...src.matchAll(/landingAsset\("([^"]+)"\)|asset\("([^"]+)"/g),
].map((m) => m[1] || m[2]);
const dir = "public/assets/landing";
const missing = [...new Set(names)].filter(
  (n) => !fs.existsSync(path.join(dir, n)),
);
console.log(`refs=${new Set(names).size} missing=${missing.length}`);
for (const m of missing) console.log("MISSING", m);
process.exit(missing.length ? 1 : 0);
