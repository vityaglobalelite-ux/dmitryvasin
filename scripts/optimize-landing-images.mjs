/**
 * Convert landing PNG/JPG → high-quality WebP (desktop + mobile).
 * Keeps visuals sharp: mild max-edge cap, quality 84–90, alpha preserved.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "public", "assets", "landing");
const BACKUP = path.join(ROOT, "assets-originals", "landing");
const MAX_EDGE = 2560; // 2× for large desktop panels; no aggressive shrink
const MIN_BYTES = 3 * 1024; // skip tiny rasters

function isRaster(name) {
  return /\.(png|jpe?g)$/i.test(name);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function convertOne(file) {
  const input = path.join(DIR, file);
  const stat = await fs.stat(input);
  if (stat.size < MIN_BYTES) {
    return { file, skipped: "tiny" };
  }

  const outName = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const output = path.join(DIR, outName);
  const backupPath = path.join(BACKUP, file);

  const img = sharp(input, { failOn: "none" });
  const meta = await img.metadata();
  const hasAlpha = Boolean(meta.hasAlpha);
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let pipeline = sharp(input, { failOn: "none" });
  if (w > MAX_EDGE || h > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: w >= h ? MAX_EDGE : undefined,
      height: h > w ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Photos vs UI-with-alpha: keep alpha clean, avoid banding
  await pipeline
    .webp({
      quality: hasAlpha ? 90 : 85,
      alphaQuality: 95,
      smartSubsample: true,
      effort: 6,
    })
    .toFile(output);

  const outStat = await fs.stat(output);
  await ensureDir(BACKUP);
  await fs.copyFile(input, backupPath);
  await fs.unlink(input);

  return {
    file,
    outName,
    before: stat.size,
    after: outStat.size,
    resized: w > MAX_EDGE || h > MAX_EDGE,
    hasAlpha,
  };
}

async function main() {
  const entries = await fs.readdir(DIR);
  const rasters = entries.filter(isRaster).sort();
  console.log(`Found ${rasters.length} raster files in ${DIR}`);

  let beforeTotal = 0;
  let afterTotal = 0;
  let converted = 0;
  let skipped = 0;

  for (const file of rasters) {
    try {
      const result = await convertOne(file);
      if (result.skipped) {
        skipped += 1;
        console.log(`skip  ${file} (${result.skipped})`);
        continue;
      }
      converted += 1;
      beforeTotal += result.before;
      afterTotal += result.after;
      const pct = Math.round((1 - result.after / result.before) * 100);
      console.log(
        `ok    ${file} → ${result.outName}  ${(result.before / 1024 / 1024).toFixed(2)}MB → ${(result.after / 1024 / 1024).toFixed(2)}MB  (-${pct}%)${result.resized ? " [resized]" : ""}`,
      );
    } catch (err) {
      console.error(`FAIL  ${file}`, err);
      process.exitCode = 1;
    }
  }

  console.log("\n---");
  console.log(`converted=${converted} skipped=${skipped}`);
  console.log(
    `total ${(beforeTotal / 1024 / 1024).toFixed(1)}MB → ${(afterTotal / 1024 / 1024).toFixed(1)}MB`,
  );
  console.log(`backups → ${BACKUP}`);
}

await main();
