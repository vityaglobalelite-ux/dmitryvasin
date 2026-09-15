const MAX_EDGE = 1920;
const WEBP_QUALITY = 0.85;
const JPEG_QUALITY = 0.85;
const SKIP_BYTES = 500 * 1024;
const GIF_RE = /^image\/gif$/i;
const ALREADY_COMPACT_RE = /^image\/(jpeg|webp)$/i;

export function isSupportCompressibleImage(file: File): boolean {
  if (GIF_RE.test(file.type)) return false;
  if (file.type === "image/svg+xml") return false;
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|bmp|avif|heic|heif)$/i.test(file.name);
}

function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim() || "image";
  return `${base}.${ext}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("image_encode"));
      },
      type,
      quality,
    );
  });
}

async function encodeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  try {
    const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
    if (webp.type === "image/webp") return webp;
  } catch {
    /* jpeg fallback */
  }
  return canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
}

/**
 * Downscale/re-encode photos before Storage so the chat preview and
 * Telegram relay stay fast. GIFs and non-images pass through.
 */
export async function prepareSupportAttachment(file: File): Promise<File> {
  if (!isSupportCompressibleImage(file)) return file;

  let source: ImageBitmap;
  try {
    source = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
  const skip =
    scale === 1 &&
    file.size <= SKIP_BYTES &&
    ALREADY_COMPACT_RE.test(file.type);

  if (skip) {
    source.close();
    return file;
  }

  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  let bitmap = source;
  if (scale < 1) {
    try {
      bitmap = await createImageBitmap(file, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: "high",
      });
      source.close();
    } catch {
      bitmap = source;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob: Blob;
  try {
    blob = await encodeCanvas(canvas);
  } catch {
    return file;
  }

  if (blob.size >= file.size && scale === 1) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], replaceExtension(file.name, ext), {
    type: blob.type,
    lastModified: Date.now(),
  });
}
