from pathlib import Path

import cairosvg
from PIL import Image
from io import BytesIO

svg = Path("public/assets/site/home/deco-arrow-mobile.svg").read_bytes()
png = cairosvg.svg2png(bytestring=svg, output_width=150, output_height=168)
im = Image.open(BytesIO(png)).convert("RGBA")
px = im.load()
xs, ys, n = 0, 0, 0
# start dot is top-right of the mobile hook
for y in range(im.height // 3):
    for x in range(im.width // 2, im.width):
        r, g, b, a = px[x, y]
        if a > 200 and r > 160 and g < 130 and b < 90 and r > g + 30:
            xs += x
            ys += y
            n += 1
print("render", im.size, "n", n, "dot", None if not n else (xs / n / 2, ys / n / 2))
