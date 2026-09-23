type ClipSource = {
  kind: string;
  sort: number;
  block_key?: string;
  gif_urls: string[] | null;
};

const PREVIEW_COUNT = 3;

/**
 * Catalog card for the posture course: two pilates-ball clips and one
 * resistance-band clip. Same trio as the still covers (01, 05, block2/03).
 * Used only when the programme actually contains these files.
 */
const POSTURE_CARD_CLIPS = [
  "/assets/site/catalog/gifs/posture/block1/01.webp",
  "/assets/site/catalog/gifs/posture/block1/05.webp",
  "/assets/site/catalog/gifs/posture/block2/03.webp",
] as const;

function lessonUrls(row: ClipSource): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const url of row.gif_urls ?? []) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }
  return urls;
}

function takeSpread(urls: string[], n: number): string[] {
  if (urls.length <= n) return urls.slice();
  if (n === 2) return [urls[0], urls[urls.length - 1]];
  return urls.slice(0, n);
}

/**
 * Up to three distinct lesson clips for course cards.
 * Never three angles of the same exercise. Two blocks → two from the first
 * (balls) and one from the second (band).
 */
export function pickPreviewClips(
  rows: ClipSource[] | null | undefined,
): string[] {
  const lessons = [...(rows ?? [])]
    .filter((row) => row.kind === "lesson")
    .sort(
      (a, b) =>
        (a.block_key ?? "").localeCompare(b.block_key ?? "") || a.sort - b.sort,
    );

  const available = new Set<string>();
  const byBlock = new Map<string, string[]>();
  for (const row of lessons) {
    const urls = lessonUrls(row);
    for (const url of urls) available.add(url);
    const head = urls[0];
    if (!head) continue;
    const key = row.block_key ?? "";
    const list = byBlock.get(key) ?? [];
    if (!list.includes(head)) list.push(head);
    byBlock.set(key, list);
  }

  if (POSTURE_CARD_CLIPS.every((url) => available.has(url))) {
    return [...POSTURE_CARD_CLIPS];
  }

  const blocks = [...byBlock.values()];
  if (blocks.length >= 2) {
    const first = takeSpread(blocks[0], 2);
    const extra: string[] = [];
    for (const block of blocks.slice(1)) {
      for (const url of block) {
        if (first.length + extra.length >= PREVIEW_COUNT) break;
        if (!first.includes(url)) extra.push(url);
      }
    }
    return [...first, ...extra].slice(0, PREVIEW_COUNT);
  }

  return (blocks[0] ?? []).slice(0, PREVIEW_COUNT);
}
