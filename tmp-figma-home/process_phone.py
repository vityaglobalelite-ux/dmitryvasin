"""Knock out the Figma flatten plate from the 2x phone export.

Keeps skin (including pale nails / highlights). Only the gray-white plate
connected to the canvas edge becomes transparent — no distance-based eat
into the hand.
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("tmp-figma-home/phone-export-2x.png")
DST = Path("public/assets/site/home/hero-phone.png")


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    arr = np.array(src)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.int16)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    # Skin stays warm even in highlights; the flatten plate is gray-white.
    plate = (chroma < 16) & ((r - b) < 10) & (luma >= 188)

    vis = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def push(y: int, x: int) -> None:
        if vis[y, x] or not plate[y, x]:
            return
        vis[y, x] = True
        q.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)

    while q:
        y, x = q.popleft()
        if x:
            push(y, x - 1)
        if x < w - 1:
            push(y, x + 1)
        if y:
            push(y - 1, x)
        if y < h - 1:
            push(y + 1, x)

    arr[:, :, 3] = np.where(vis, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr, "RGBA")
    DST.parent.mkdir(parents=True, exist_ok=True)
    out.save(DST, "PNG")
    print("saved", DST, out.size, "opaque", int((arr[:, :, 3] == 255).sum()), "bbox", out.getbbox())


if __name__ == "__main__":
    main()
