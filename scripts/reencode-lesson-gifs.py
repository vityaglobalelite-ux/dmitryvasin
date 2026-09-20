"""Re-encode posture lesson animated WebPs smaller for the compact 480px stage."""

from __future__ import annotations

import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
GIF_DIR = ROOT / "public/assets/site/catalog/gifs/posture"
WIDTH = 640
QUALITY = 55
METHOD = 6
DEFAULT_MS = 83


def resize_frame(im: Image.Image) -> Image.Image:
    frame = im.convert("RGBA")
    w, h = frame.size
    if w <= WIDTH:
        return frame
    height = max(1, round(h * (WIDTH / w)))
    if height % 2:
        height += 1
    return frame.resize((WIDTH, height), Image.Resampling.LANCZOS)


def encode(path: pathlib.Path) -> None:
    still = path.with_name(f"{path.stem}-still.webp")
    src = Image.open(path)
    frames: list[Image.Image] = []
    durations: list[int] = []
    n = getattr(src, "n_frames", 1)
    for i in range(n):
        src.seek(i)
        frames.append(resize_frame(src))
        durations.append(int(src.info.get("duration") or DEFAULT_MS))
    if not frames:
        raise SystemExit(f"no frames in {path}")
    tmp = path.with_suffix(".tmp.webp")
    frames[0].save(
        tmp,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        quality=QUALITY,
        method=METHOD,
    )
    still_tmp = still.with_suffix(".tmp.webp")
    frames[0].save(still_tmp, format="WEBP", quality=78, method=METHOD)
    tmp.replace(path)
    still_tmp.replace(still)
    src.close()
    kb = path.stat().st_size / 1024
    print(f"{path.relative_to(GIF_DIR)} -> {kb:.0f} KB, {len(frames)} frames", flush=True)


def main() -> None:
    files = sorted(
        p
        for p in GIF_DIR.rglob("*.webp")
        if "still" not in p.name and ".tmp." not in p.name
    )
    if not files:
        raise SystemExit("no animated webps found")
    for path in files:
        encode(path)


if __name__ == "__main__":
    main()
