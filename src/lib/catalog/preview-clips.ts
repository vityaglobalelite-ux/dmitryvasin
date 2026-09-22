type ClipSource = {
  kind: string;
  sort: number;
  block_key?: string;
  gif_urls: string[] | null;
};

const PREVIEW_COUNT = 3;

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

/**
 * Catalog cards: the lesson that already has several clips, in stored order.
 * That is the posture sequence «Как перестать падать…» (03, 03-1, 03-11).
 * A course with only single clips keeps one frame from each, up to three.
 */
export function pickPreviewClips(
  rows: ClipSource[] | null | undefined,
): string[] {
  const lessons = [...(rows ?? [])]
    .filter((row) => row.kind === "lesson")
    .sort(
      (a, b) =>
        a.sort - b.sort ||
        (a.block_key ?? "").localeCompare(b.block_key ?? ""),
    )
    .map(lessonUrls)
    .filter((urls) => urls.length > 0);

  const showcase = lessons.find((urls) => urls.length >= PREVIEW_COUNT);
  if (showcase) return showcase.slice(0, PREVIEW_COUNT);

  const richest = [...lessons].sort((a, b) => b.length - a.length)[0];
  if (richest && richest.length > 1) return richest.slice(0, PREVIEW_COUNT);

  return lessons.slice(0, PREVIEW_COUNT).map((urls) => urls[0]);
}
