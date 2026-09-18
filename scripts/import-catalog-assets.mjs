/**
 * Unpack Figma plaque zip + posture gifs → public/assets/site/catalog/
 *
 *   node scripts/import-catalog-assets.mjs
 *   python scripts/import-catalog-assets.py
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
execSync(`python "${path.join(__dirname, "import-catalog-assets.py")}"`, {
  stdio: "inherit",
});
