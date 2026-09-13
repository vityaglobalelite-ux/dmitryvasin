"""Knock out the Figma flatten plate from the 2x phone export."""

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path("tmp-figma-home/phone-export-2x.png")
DST = Path("public/assets/site/home/hero-phone.png")


def is_plate(r: int, g: int, b: int, a: int) -> bool:
    if a < 8:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = mx - mn
    if luma > 224 and chroma < 36:
        return True
    if luma > 246:
        return True
    return False


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    pix = src.load()
    out = src.copy()
    opx = out.load()
    visited = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        i = y * w + x
        if visited[i]:
            continue
        visited[i] = 1
        r, g, b, a = opx[x, y]
        if not is_plate(r, g, b, a):
            continue
        opx[x, y] = (0, 0, 0, 0)
        if x:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))

    import numpy as np
    from numpy import inf

    arr = np.array(out)
    alpha = arr[:, :, 3] > 0
    rgb = arr[:, :, :3].astype(np.int16)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    luma = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    chroma = mx - mn
    light = (luma > 200) & (chroma < 55)

    # Distance to transparency: eat the leftover white matte, keep screen
    # (screen white sits behind the black bezel, far from alpha=0).
    inf_dist = w + h
    dist = np.full((h, w), inf_dist, dtype=np.int32)
    dist[~alpha] = 0
    for y in range(1, h):
        dist[y] = np.minimum(dist[y], dist[y - 1] + 1)
        dist[y, 1:] = np.minimum(dist[y, 1:], dist[y, :-1] + 1)
    for y in range(h - 2, -1, -1):
        dist[y] = np.minimum(dist[y], dist[y + 1] + 1)
        dist[y, :-1] = np.minimum(dist[y, :-1], dist[y, 1:] + 1)
    arr[:, :, 3] = np.where(light & (dist <= 18), 0, arr[:, :, 3])
    out = Image.fromarray(arr, "RGBA")

    DST.parent.mkdir(parents=True, exist_ok=True)
    out.save(DST, "PNG")
    print("saved", DST, out.size, "bbox", out.getbbox())


if __name__ == "__main__":
    main()
