import json
import pathlib
import re
import sys
import zipfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/site/catalog"
DOWNLOADS = pathlib.Path.home() / "Downloads"


def find_zip(size: int) -> pathlib.Path:
    for path in DOWNLOADS.glob("*.zip"):
        if path.stat().st_size == size:
            return path
    raise SystemExit(f"zip size {size} not found")


def find_gif_zip() -> pathlib.Path:
    for path in DOWNLOADS.glob("*.zip"):
        if "gif" in path.name.lower() and 29_000_000 < path.stat().st_size < 33_000_000:
            return path
    raise SystemExit("gif zip not found")


def to_webp(data: bytes, dest: pathlib.Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    import io

    image = Image.open(io.BytesIO(data))
    image.save(dest, format="WEBP", quality=86)


def main() -> None:
    plaque_zip = find_zip(17948107)
    gif_zip = find_gif_zip()
    covers = OUT / "covers"
    covers.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(plaque_zip) as zf:
        names = zf.namelist()
        for n in range(1, 10):
            for frame in range(1, 4):
                def peek_match(name: str) -> bool:
                    norm = name.replace("\\", "/").lower()
                    if "подсмотр" not in norm:
                        return False
                    if f"урок {n}/" not in norm and f"урок {n}\\" not in name.lower():
                        return False
                    return norm.endswith(
                        (f"/{frame}.png", f"/{frame}.jpg", f"/{frame}.jpeg"),
                    )

                entry = next((name for name in names if peek_match(name)), None)
                if not entry:
                    print(f"warn: peek {n} frame {frame} missing", file=sys.stderr)
                    continue
                data = zf.read(entry)
                dest = covers / f"peek-{n:02d}-{frame}.webp"
                to_webp(data, dest)

        for frame in range(1, 4):
            pat = re.compile(
                rf"курс\s*2.*плашки.*[/\\]{frame}\.(jpg|jpeg)$",
                re.I,
            )
            entry = next((name for name in names if pat.search(name.replace("\\", "/"))), None)
            if not entry:
                print(f"warn: course-2 frame {frame} missing", file=sys.stderr)
                continue
            data = zf.read(entry)
            dest = covers / f"course-2-{frame}.webp"
            to_webp(data, dest)

    gif_map_b1 = [
        ("1.gif", "01.gif"),
        ("2.gif", "02.gif"),
        ("3.gif", "03.gif"),
        ("3,1.gif", "03-1.gif"),
        ("3,11.gif", "03-11.gif"),
        ("4.gif", "04.gif"),
        ("5.gif", "05.gif"),
    ]
    gif_map_b2 = [
        ("1.2.gif", "01.gif"),
        ("2.2.gif", "02.gif"),
        ("3.2.gif", "03.gif"),
        ("4.2.gif", "04.gif"),
    ]

    with zipfile.ZipFile(gif_zip) as zf:
        names = zf.namelist()
        for src, dest_name in gif_map_b1:
            pat = re.compile(rf"блок\s*1.*/{re.escape(src)}$", re.I)
            entry = next((name for name in names if pat.search(name.replace("\\", "/"))), None)
            if not entry:
                print(f"warn: block1 {src} missing", file=sys.stderr)
                continue
            dest = OUT / "gifs/posture/block1" / dest_name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(zf.read(entry))

        for src, dest_name in gif_map_b2:
            pat = re.compile(rf"блок\s*2.*/{re.escape(src)}$", re.I)
            entry = next((name for name in names if pat.search(name.replace("\\", "/"))), None)
            if not entry:
                print(f"warn: block2 {src} missing", file=sys.stderr)
                continue
            dest = OUT / "gifs/posture/block2" / dest_name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(zf.read(entry))

    print("Catalog assets imported.")


if __name__ == "__main__":
    main()
