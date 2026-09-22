"""
Unpack Figma plaque zip + posture gifs → public/assets/site/catalog/

  python scripts/import-catalog-assets.py
  node scripts/import-catalog-assets.mjs
"""
from __future__ import annotations

import io
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/site/catalog"
DOWNLOADS = pathlib.Path.home() / "Downloads"

PLAQUE_NAMES = (
    "Плашки под сайт_каталог (2).zip",
    "Плашки под сайт_каталог (1).zip",
    "Плашки под сайт_каталог.zip",
)
PLAQUE_ZIP_SIZES = (32_519_136, 17_948_107)
GIF_NAMES = (
    "gif-20260919T221519Z-1-001.zip",
)

GIF_MAP_B1 = [
    ("1.gif", "01"),
    ("2.gif", "02"),
    ("3.gif", "03"),
    ("3,1.gif", "03-1"),
    ("3,11.gif", "03-11"),
    ("4.gif", "04"),
    ("5.gif", "05"),
]
GIF_MAP_B2 = [
    ("1.2.gif", "01"),
    ("2.2.gif", "02"),
    ("3.2.gif", "03"),
    ("4.2.gif", "04"),
]


def find_zip_by_size(size: int) -> pathlib.Path:
    for path in DOWNLOADS.glob("*.zip"):
        if path.stat().st_size == size:
            return path
    raise SystemExit(f"zip size {size} not found in {DOWNLOADS}")


def find_plaque_zip() -> pathlib.Path:
    for name in PLAQUE_NAMES:
        path = DOWNLOADS / name
        if path.is_file():
            return path
    for size in PLAQUE_ZIP_SIZES:
        try:
            return find_zip_by_size(size)
        except SystemExit:
            continue
    raise SystemExit(f"plaque zip not found in {DOWNLOADS}")


def find_gif_zip() -> pathlib.Path:
    for name in GIF_NAMES:
        path = DOWNLOADS / name
        if path.is_file():
            return path
    matches = [
        path
        for path in DOWNLOADS.glob("*.zip")
        if "gif" in path.name.lower() and 29_000_000 < path.stat().st_size < 33_000_000
    ]
    if matches:
        return matches[0]
    raise SystemExit("gif zip not found")


def ffmpeg_bin() -> str:
    found = shutil.which("ffmpeg")
    if not found:
        raise SystemExit("ffmpeg is required to convert posture GIFs to animated WebP")
    return found


def to_webp_still(data: bytes, dest: pathlib.Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    image = Image.open(io.BytesIO(data))
    image.save(dest, format="WEBP", quality=86)


def run_ffmpeg(args: list[str]) -> None:
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(
            f"ffmpeg failed ({result.returncode}): {' '.join(args)}\n{result.stderr[-2000:]}"
        )


def gif_to_cover_webps(src: pathlib.Path, dest: pathlib.Path, still: pathlib.Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    still.parent.mkdir(parents=True, exist_ok=True)
    ff = ffmpeg_bin()
    run_ffmpeg(
        [
            ff,
            "-y",
            "-i",
            str(src),
            "-vf",
            "scale=640:-2:flags=lanczos",
            "-an",
            "-c:v",
            "libwebp",
            "-q:v",
            "55",
            "-compression_level",
            "6",
            "-loop",
            "0",
            str(dest),
        ]
    )
    run_ffmpeg(
        [
            ff,
            "-y",
            "-i",
            str(src),
            "-frames:v",
            "1",
            "-vf",
            "scale=640:-2:flags=lanczos",
            "-an",
            "-c:v",
            "libwebp",
            "-q:v",
            "78",
            str(still),
        ]
    )


def import_plaques(plaque_zip: pathlib.Path) -> None:
    covers = OUT / "covers"
    covers.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(plaque_zip) as zf:
        names = zf.namelist()
        for n in range(1, 10):
            for frame in range(1, 4):
                def peek_match(name: str, lesson: int = n, frame_n: int = frame) -> bool:
                    norm = name.replace("\\", "/").lower()
                    if "подсмотр" not in norm:
                        return False
                    if f"урок {lesson}/" not in norm:
                        return False
                    return norm.endswith(
                        (f"/{frame_n}.png", f"/{frame_n}.jpg", f"/{frame_n}.jpeg"),
                    )

                entry = next((name for name in names if peek_match(name)), None)
                if not entry:
                    print(f"warn: peek {n} frame {frame} missing", file=sys.stderr)
                    continue
                to_webp_still(zf.read(entry), covers / f"peek-{n:02d}-{frame}.webp")

        for frame in range(1, 4):
            pat = re.compile(
                rf"курс\s*2.*плашки.*[/\\]{frame}\.(jpg|jpeg)$",
                re.I,
            )
            entry = next(
                (name for name in names if pat.search(name.replace("\\", "/"))),
                None,
            )
            if not entry:
                print(f"warn: course-2 frame {frame} missing", file=sys.stderr)
                continue
            to_webp_still(zf.read(entry), covers / f"course-2-{frame}.webp")

        import_lifehack_plaques(zf, names, covers)


def import_lifehack_plaques(
    zf: zipfile.ZipFile,
    names: list[str],
    covers: pathlib.Path,
) -> None:
    """Lifehack folders: «N лайфхак …/1.png» → covers/lifehack-0N-F.webp."""
    for n in range(1, 10):
        for frame in range(1, 4):
            def lifehack_match(
                name: str, hack: int = n, frame_n: int = frame
            ) -> bool:
                norm = name.replace("\\", "/")
                low = norm.lower()
                if "лайфхак" not in low:
                    return False
                # «1 лайфхак …/1.png» — number before «лайфхак», not the empty «4 …/» dir
                if not re.search(rf"(^|/){hack}\s+лайфхак", low):
                    return False
                return low.endswith(
                    (f"/{frame_n}.png", f"/{frame_n}.jpg", f"/{frame_n}.jpeg"),
                )

            entry = next((name for name in names if lifehack_match(name)), None)
            if not entry:
                if n <= 3:
                    print(
                        f"warn: lifehack {n} frame {frame} missing",
                        file=sys.stderr,
                    )
                continue
            dest = covers / f"lifehack-{n:02d}-{frame}.webp"
            print(f"lifehack {n}/{frame} -> {dest.relative_to(ROOT)}")
            to_webp_still(zf.read(entry), dest)


def import_gifs(gif_zip: pathlib.Path) -> None:
    scratch = ROOT / ".tmp" / "catalog-gifs"
    if scratch.exists():
        shutil.rmtree(scratch)
    scratch.mkdir(parents=True)

    with zipfile.ZipFile(gif_zip) as zf:
        names = zf.namelist()
        jobs: list[tuple[str, pathlib.Path, pathlib.Path]] = []

        for src_name, stem in GIF_MAP_B1:
            pat = re.compile(rf"блок\s*1.*/{re.escape(src_name)}$", re.I)
            entry = next(
                (name for name in names if pat.search(name.replace("\\", "/"))),
                None,
            )
            if not entry:
                print(f"warn: block1 {src_name} missing", file=sys.stderr)
                continue
            raw = scratch / "block1" / src_name
            raw.parent.mkdir(parents=True, exist_ok=True)
            raw.write_bytes(zf.read(entry))
            dest_dir = OUT / "gifs/posture/block1"
            jobs.append((f"block1/{src_name}", dest_dir / f"{stem}.webp", dest_dir / f"{stem}-still.webp"))

        for src_name, stem in GIF_MAP_B2:
            pat = re.compile(rf"блок\s*2.*/{re.escape(src_name)}$", re.I)
            entry = next(
                (name for name in names if pat.search(name.replace("\\", "/"))),
                None,
            )
            if not entry:
                print(f"warn: block2 {src_name} missing", file=sys.stderr)
                continue
            raw = scratch / "block2" / src_name
            raw.parent.mkdir(parents=True, exist_ok=True)
            raw.write_bytes(zf.read(entry))
            dest_dir = OUT / "gifs/posture/block2"
            jobs.append((f"block2/{src_name}", dest_dir / f"{stem}.webp", dest_dir / f"{stem}-still.webp"))

    for label, dest, still in jobs:
        src = scratch / label
        print(f"convert {label} -> {dest.relative_to(ROOT)}")
        gif_to_cover_webps(src, dest, still)

    shutil.rmtree(scratch, ignore_errors=True)
    copy_posture_photo_covers()


def copy_posture_photo_covers() -> None:
    """Course cards use still photos, not lesson GIFs. Same 3-frame rhythm as peeks."""
    covers = OUT / "covers"
    b1 = OUT / "gifs/posture/block1"
    b2 = OUT / "gifs/posture/block2"
    copies = [
        (b1 / "01-still.webp", covers / "posture-1.webp"),
        (b1 / "05-still.webp", covers / "posture-2.webp"),
        (b2 / "03-still.webp", covers / "posture-3.webp"),
        (b1 / "01-still.webp", covers / "posture-b1-1.webp"),
        (b1 / "05-still.webp", covers / "posture-b1-2.webp"),
        (b1 / "03-11-still.webp", covers / "posture-b1-3.webp"),
        (b2 / "01-still.webp", covers / "posture-b2-1.webp"),
        (b2 / "03-still.webp", covers / "posture-b2-2.webp"),
        (b2 / "04-still.webp", covers / "posture-b2-3.webp"),
    ]
    for src, dest in copies:
        if not src.is_file():
            print(f"warn: missing still {src.name}", file=sys.stderr)
            continue
        shutil.copyfile(src, dest)


def main() -> None:
    plaque_zip = find_plaque_zip()
    print(f"plaques: {plaque_zip}")
    import_plaques(plaque_zip)
    if "--plaques-only" in sys.argv:
        print("Catalog plaque assets imported (--plaques-only).")
        return
    gif_zip = find_gif_zip()
    print(f"gifs:    {gif_zip}")
    import_gifs(gif_zip)
    print("Catalog assets imported.")


if __name__ == "__main__":
    main()
