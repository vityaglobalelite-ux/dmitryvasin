"""Build the 1200x630 Open Graph image from current landing hero assets.

Layout follows the Figma hero (copy, Involve Bold, brand gradient, Dmitry cutout)
cropped for social safe-zones — not the old Tilda banner.
"""

from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "images" / "og-share.png"
W, H = 1200, 630

# Figma 249:1399 — same stops as --brand-gradient
STOPS = (
    (0.026, (0xDB, 0x0C, 0x25)),
    (0.3663, (0xE0, 0x4C, 0x29)),
    (1.0573, (0xEF, 0xB9, 0x91)),
)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def mix(c0: tuple[int, int, int], c1: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c0[0], c1[0], t)),
        int(lerp(c0[1], c1[1], t)),
        int(lerp(c0[2], c1[2], t)),
    )


def color_at(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    for i in range(len(STOPS) - 1):
        p0, c0 = STOPS[i]
        p1, c1 = STOPS[i + 1]
        if t <= p1 or i == len(STOPS) - 2:
            span = p1 - p0
            u = 0.0 if span == 0 else (t - p0) / span
            return mix(c0, c1, max(0.0, min(1.0, u)))
    return STOPS[-1][1]


def brand_gradient(w: int, h: int) -> Image.Image:
    """CSS 129.34deg linear-gradient, y-down."""
    angle = math.radians(129.34)
    dx, dy = math.sin(angle), -math.cos(angle)
    xs = np.linspace(0.0, 1.0, w, dtype=np.float32)
    ys = np.linspace(0.0, 1.0, h, dtype=np.float32)
    grid_x, grid_y = np.meshgrid(xs, ys)
    proj = grid_x * dx + grid_y * dy
    pmin, pmax = float(proj.min()), float(proj.max())
    t = (proj - pmin) / (pmax - pmin)
    # Sample 1024 stops, then index
    lut = np.array([color_at(i / 1023) for i in range(1024)], dtype=np.uint8)
    idx = np.clip((t * 1023).astype(np.int32), 0, 1023)
    rgb = lut[idx]
    return Image.fromarray(rgb, "RGB")


def rasterize_svg(src: Path, dest: Path, width: int, height: int) -> None:
    js = f"""
    const sharp = require('sharp');
    sharp({str(src).replace(chr(92), '/')!r})
      .resize({width}, {height}, {{ fit: 'fill' }})
      .png()
      .toFile({str(dest).replace(chr(92), '/')!r})
      .then(() => process.exit(0))
      .catch((err) => {{ console.error(err); process.exit(1); }});
    """
    subprocess.check_call(["node", "-e", js], cwd=ROOT)


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = ROOT / "public" / "assets" / "fonts" / name
    return ImageFont.truetype(str(path), size)


def draw_tracking(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, ...] | str,
    tracking: float,
) -> int:
    """Draw uppercase hero type with negative tracking. Returns width."""
    x, y = xy
    for i, ch in enumerate(text):
        draw.text((x, y), ch, font=font, fill=fill)
        box = font.getbbox(ch)
        x += (box[2] - box[0]) + tracking
        if i < len(text) - 1:
            pass
    return int(x - xy[0])


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / "tmp-og-build"
    tmp.mkdir(exist_ok=True)

    canvas = brand_gradient(W, H).convert("RGBA")

    swirl_png = tmp / "swirl.png"
    rasterize_svg(
        ROOT / "public" / "assets" / "landing" / "hero-swirl.svg",
        swirl_png,
        1260,
        640,
    )
    swirl = Image.open(swirl_png).convert("RGBA")
    canvas.alpha_composite(swirl, (-40, -20))

    dmitry = Image.open(ROOT / "public" / "assets" / "landing" / "hero-dmitry.webp").convert(
        "RGBA"
    )
    # Face-forward crop: fill the right ~52% of the card, feet clipped.
    target_h = 720
    scale = target_h / dmitry.height
    dmitry = dmitry.resize(
        (round(dmitry.width * scale), target_h), Image.Resampling.LANCZOS
    )
    dx = W - dmitry.width + 40
    dy = H - dmitry.height + 36
    canvas.alpha_composite(dmitry, (dx, dy))

    # Soft left veil so type stays readable over the photo overlap.
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    veil_px = np.zeros((H, W, 4), dtype=np.uint8)
    for x in range(0, 560):
        a = int(36 * (1.0 - x / 560.0) ** 1.4)
        veil_px[:, x, 0] = 0x4C
        veil_px[:, x, 1] = 0x0D
        veil_px[:, x, 2] = 0x32
        veil_px[:, x, 3] = a
    veil = Image.fromarray(veil_px, "RGBA")
    canvas.alpha_composite(veil)

    draw = ImageDraw.Draw(canvas)
    bold = load_font("Involve-Bold.ttf", 72)
    sub_bold = load_font("Involve-Bold.ttf", 26)
    regular = load_font("Involve-Regular.ttf", 26)

    tracking = -2.2
    x0, y0 = 64, 118
    draw_tracking(draw, "90 ДНЕЙ", (x0 + 72, y0), bold, (255, 255, 255, 255), tracking)
    draw_tracking(draw, "ИССЛЕДОВАНИЯ", (x0, y0 + 82), bold, (255, 255, 255, 255), tracking)
    draw_tracking(draw, "ТАНГО", (x0, y0 + 164), bold, (255, 255, 255, 255), tracking)

    chip_png = tmp / "chip.png"
    rasterize_svg(
        ROOT / "public" / "assets" / "landing" / "hero-calendar-chip.svg",
        chip_png,
        58,
        58,
    )
    chip = Image.open(chip_png).convert("RGBA")
    canvas.alpha_composite(chip, (x0, y0 + 8))

    # Hero subtitle (Figma 249:1431): «Готовы по-новому прочувствовать / и понять свой танец?»
    sub_y = y0 + 268
    white = (255, 255, 255, 255)

    def line(parts: list[tuple[str, ImageFont.FreeTypeFont]], y: int) -> None:
        x = x0
        for text, font in parts:
            draw.text((x, y), text, font=font, fill=white)
            x += font.getbbox(text)[2]

    line(
        [("Готовы ", regular), ("по-новому", sub_bold), (" прочувствовать", regular)],
        sub_y,
    )
    line(
        [("и ", regular), ("понять", sub_bold), (" свой танец?", regular)],
        sub_y + 36,
    )

    rgb = canvas.convert("RGB")
    # Slight sharpen for text after resize/composite
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=80, threshold=2))
    rgb.save(OUT, "PNG", optimize=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
