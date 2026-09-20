"""Encode lesson preview clips for the product/account programme stages.

Sources are the animated WebPs under ``assets-originals`` (not served). Each one
produces three files that share a base path under ``public``:

    <base>.webm       AV1, first choice
    <base>.mp4        H.264, fallback for browsers without AV1
    <base>-still.webp poster, painted before the video decodes

``src/lib/catalog/lesson-clip.ts`` derives all three from the single clip url the
catalog stores, so the three must keep their shared base name.

Needs Pillow and an ffmpeg built with libsvtav1 and libx264.
"""

from __future__ import annotations

import math
import pathlib
import shutil
import struct
import subprocess
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets-originals/site/catalog/gifs"
OUT_DIR = ROOT / "public/assets/site/catalog/gifs"

WIDTH = 640
# Webp sources were already encoded lossily, so their artefacts cost the video
# encoders bits without carrying detail. A light denoise buys roughly 10%.
DENOISE = "hqdn3d=2:1.5:3:3"
AV1_CRF = 38
H264_CRF = 27
POSTER_QUALITY = 80
MAX_FPS = 30
# Clips loop from the top and are never seeked into, so one keyframe is enough.
GOP = 600


def frame_durations(path: pathlib.Path) -> list[int]:
    """Per-frame durations in ms, read from the WebP ANMF chunks.

    Pillow does not surface them for animated WebP, and guessing a frame rate
    would silently change playback speed.
    """
    data = path.read_bytes()
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise SystemExit(f"{path}: not a WebP file")
    durations: list[int] = []
    offset = 12
    while offset + 8 <= len(data):
        fourcc = data[offset : offset + 4]
        size = struct.unpack("<I", data[offset + 4 : offset + 8])[0]
        if fourcc == b"ANMF":
            raw = data[offset + 20 : offset + 23]
            durations.append(raw[0] | raw[1] << 8 | raw[2] << 16)
        offset += 8 + size + (size & 1)
    return durations


def resize(frame: Image.Image) -> Image.Image:
    rgb = frame.convert("RGB")
    width, height = rgb.size
    if width <= WIDTH:
        return rgb
    scaled = max(2, round(height * (WIDTH / width)))
    if scaled % 2:
        scaled += 1
    return rgb.resize((WIDTH, scaled), Image.Resampling.LANCZOS)


def explode(
    path: pathlib.Path, work: pathlib.Path
) -> tuple[pathlib.Path, int, Image.Image, int]:
    """Write every frame as PNG plus a concat list carrying the real timings."""
    src = Image.open(path)
    count = getattr(src, "n_frames", 1)
    durations = frame_durations(path)
    if len(durations) != count:
        # A still WebP has no ANMF chunks; anything else means a malformed file.
        if count == 1 and not durations:
            durations = [0]
        else:
            raise SystemExit(
                f"{path}: {count} frames but {len(durations)} frame durations",
            )

    first: Image.Image | None = None
    lines: list[str] = []
    for index in range(count):
        src.seek(index)
        frame = resize(src)
        if first is None:
            first = frame.copy()
        name = f"{index:05d}.png"
        frame.save(work / name)
        lines.append(f"file '{name}'")
        lines.append(f"duration {max(durations[index], 10) / 1000:.3f}")
    # The concat demuxer drops the final entry's duration unless the last image
    # is repeated, which would otherwise clip the last frame off every loop.
    lines.append(f"file '{count - 1:05d}.png'")
    src.close()
    if first is None:
        raise SystemExit(f"{path}: no frames")

    listing = work / "frames.txt"
    listing.write_text("\n".join(lines) + "\n", encoding="utf-8")
    # Resample to a constant rate the video codecs can key off. The shortest
    # frame sets the floor, so every source frame survives the resample; a rate
    # above the cap would start dropping them, which must not pass silently.
    # Rounding down would put the output interval above the shortest frame and
    # let the resampler drop it, so round up: duplicated frames cost almost
    # nothing to inter-frame coding, missing ones cannot be recovered.
    native = 1000 / max(min(durations), 10)
    if native > MAX_FPS:
        raise SystemExit(
            f"{path}: needs {native:.0f}fps to keep every frame, above the "
            f"{MAX_FPS}fps cap — raise MAX_FPS or thin the source",
        )
    fps = max(1, math.ceil(native))
    return listing, fps, first, count


def run(args: list[str]) -> None:
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        tail = "\n".join(result.stderr.strip().splitlines()[-6:])
        raise SystemExit(f"ffmpeg failed ({result.returncode}):\n{tail}")


def count_frames(path: pathlib.Path) -> int:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-count_frames", "-show_entries", "stream=nb_read_frames",
            "-of", "csv=p=0", str(path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(f"ffprobe failed on {path}:\n{result.stderr.strip()}")
    return int(result.stdout.strip().strip(","))


def verify(out: pathlib.Path, source_frames: int) -> None:
    """Resampling to a constant rate may duplicate frames but must never lose
    one, and no argument about rounding is worth as much as counting them."""
    written = count_frames(out)
    if written < source_frames:
        raise SystemExit(
            f"{out}: {written} frames encoded from {source_frames} source "
            "frames — the resample dropped motion",
        )


def encode(path: pathlib.Path) -> None:
    target = OUT_DIR / path.relative_to(SRC_DIR)
    target.parent.mkdir(parents=True, exist_ok=True)
    base = target.with_suffix("")
    work = pathlib.Path(tempfile.mkdtemp(prefix="lesson-clip-"))
    try:
        listing, fps, first, frames = explode(path, work)
        source = [
            "ffmpeg", "-v", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(listing),
            "-vf", f"{DENOISE},fps={fps},format=yuv420p",
            "-fps_mode", "cfr", "-an",
        ]
        run(source + [
            "-c:v", "libsvtav1", "-preset", "4", "-crf", str(AV1_CRF),
            "-g", str(GOP), str(base.with_suffix(".webm")),
        ])
        run(source + [
            "-c:v", "libx264", "-profile:v", "main", "-preset", "veryslow",
            "-crf", str(H264_CRF), "-g", str(GOP), "-bf", "3",
            "-movflags", "+faststart", str(base.with_suffix(".mp4")),
        ])
        verify(base.with_suffix(".webm"), frames)
        verify(base.with_suffix(".mp4"), frames)
        first.save(
            base.with_name(f"{base.name}-still.webp"),
            format="WEBP",
            quality=POSTER_QUALITY,
            method=6,
        )
    finally:
        shutil.rmtree(work, ignore_errors=True)

    def kb(suffix: str) -> str:
        return f"{base.with_suffix(suffix).stat().st_size / 1024:.0f} KB"

    print(
        f"{path.relative_to(SRC_DIR)} @ {fps}fps -> "
        f"webm {kb('.webm')}, mp4 {kb('.mp4')}, "
        f"poster {base.with_name(f'{base.name}-still.webp').stat().st_size / 1024:.0f} KB",
        flush=True,
    )


def main() -> None:
    if not SRC_DIR.is_dir():
        raise SystemExit(f"missing source directory {SRC_DIR}")
    files = sorted(
        p for p in SRC_DIR.rglob("*.webp") if not p.stem.endswith("-still")
    )
    if not files:
        raise SystemExit(f"no animated webps under {SRC_DIR}")
    for path in files:
        encode(path)


if __name__ == "__main__":
    main()
