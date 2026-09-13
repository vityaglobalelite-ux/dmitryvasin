"""Flood-fill near-white plates from icon PNG corners."""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path("public/assets/site/home")
FILES = [
    "idea.png",
    "icon-access.png",
    "quote-open.png",
    "question.png",
    "cat-lifehack.png",
    "cat-lesson.png",
    "cat-course.png",
    "cat-research.png",
    "dir-awareness.png",
    "dir-technique.png",
    "dir-musicality.png",
    "dir-interaction.png",
    "dir-variation.png",
]


def is_plate(r: int, g: int, b: int, a: int) -> bool:
    if a < 8:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = mx - mn
    return luma > 242 and chroma < 18


def knockout(path: Path) -> None:
    src = Image.open(path).convert("RGBA")
    w, h = src.size
    out = src.copy()
    px = out.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    n = 0
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if not is_plate(r, g, b, a):
            continue
        px[x, y] = (0, 0, 0, 0)
        n += 1
        if x:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))
    out.save(path)
    print(f"{path.name}: knocked {n} bbox={out.getbbox()}")


def main() -> None:
    for name in FILES:
        knockout(ROOT / name)


if __name__ == "__main__":
    main()
