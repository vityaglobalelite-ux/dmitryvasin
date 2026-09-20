/**
 * The catalog stores one url per lesson clip (`lesson.gifUrls`), historically an
 * animated WebP. `scripts/encode-lesson-clips.py` now emits a poster plus two
 * video encodes that share that url's base path, so the renderer derives them
 * from the stored url rather than the catalog carrying three columns. Whatever
 * extension the stored url uses, the base name is the key.
 */

export type LessonClip = {
  /** AV1, ~2x smaller than the H.264 encode. */
  webm: string;
  /** H.264 fallback for browsers without AV1 decoding. */
  mp4: string;
  /** Painted until the video has a frame, and used for the carousel thumbs. */
  poster: string;
};

/**
 * Returns the clip's derived sources, or null for urls that are not encoded
 * clips (externally hosted stills), which render as plain images instead.
 */
export function lessonClip(url: string): LessonClip | null {
  if (!url.includes("/gifs/")) return null;
  const base = url.replace(/(-still)?\.[a-z0-9]+$/i, "");
  if (!base) return null;
  return {
    webm: `${base}.webm`,
    mp4: `${base}.mp4`,
    poster: `${base}-still.webp`,
  };
}
