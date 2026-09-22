type ClipSource = {
  kind: string;
  sort: number;
  block_key?: string;
  gif_urls: string[] | null;
};

const PREVIEW_COUNT = 3;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Stable sample: the same product always shows the same clips, in lesson order,
 * but not mechanically the first three. A fresh random pick would flicker
 * between visits and disagree with the server render.
 */
function pickStable<T>(seed: string, items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const ranked = items.map((item, index) => ({
    item,
    index,
    score: hashString(`${seed}:${index}`),
  }));
  ranked.sort((a, b) => a.score - b.score || a.index - b.index);
  return ranked
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map((row) => row.item);
}

/** One showcase clip per lesson, then three spread through the course. */
export function pickPreviewClips(
  seed: string,
  rows: ClipSource[] | null | undefined,
): string[] {
  const lessons = [...(rows ?? [])]
    .filter((row) => row.kind === "lesson")
    .sort(
      (a, b) =>
        a.sort - b.sort ||
        (a.block_key ?? "").localeCompare(b.block_key ?? ""),
    );

  const candidates: string[] = [];
  const seen = new Set<string>();
  for (const lesson of lessons) {
    const url = (lesson.gif_urls ?? []).find((item) => item.trim());
    if (!url || seen.has(url)) continue;
    seen.add(url);
    candidates.push(url);
  }

  return pickStable(seed, candidates, PREVIEW_COUNT);
}
