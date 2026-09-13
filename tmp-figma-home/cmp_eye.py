from pathlib import Path

from PIL import Image

fig = Image.open("tmp-figma-home/fig-look.png").convert("RGB")
live = Image.open("tmp-figma-home/live-eye.png").convert("RGB")


def orange_center(im, x0=0, y0=0, x1=None, y1=None):
    x1 = im.width if x1 is None else x1
    y1 = im.height if y1 is None else y1
    px = im.load()
    xs, ys, n = 0, 0, 0
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            if r > 160 and g < 120 and b < 80 and r > g + 40:
                xs += x
                ys += y
                n += 1
    if not n:
        return None
    return xs / n, ys / n, n


print("fig", fig.size, "orange", orange_center(fig))
print("live", live.size, "orange", orange_center(live))
# live clip is (0,55)-(280,145); Figma group is (20,69)-(260,142)
# so Figma group in live crop starts at (20, 14)
print("live in group-ish", orange_center(live, 20, 14, 260, 87))
