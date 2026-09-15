"""Build the 1200x630 catalog Open Graph image from the new home hero.

Layout is a share-safe crop of Figma «Главная десктоп» 572:1864:
studio, phone mockup, Involve slogan, eye + quote marks from local Figma exports.
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
HOME = ROOT / "public" / "assets" / "site" / "home"
FONTS = ROOT / "public" / "assets" / "fonts"
OUT = ROOT / "public" / "assets" / "images" / "og-photo.png"

# Compose at 2x, then downscale — sharp type on 1200x630.
SCALE = 2
W, H = 1200 * SCALE, 630 * SCALE

PLUM = (0x4C, 0x0D, 0x32)
PLUM_MID = (0x76, 0x26, 0x55)
WHITE = (255, 255, 255, 255)
TEXT = (0x2A, 0x2A, 0x2E, 255)

# Figma 249:1399 — same stops as --brand-gradient
BRAND_STOPS = (
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


def brand_color_at(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    for i in range(len(BRAND_STOPS) - 1):
        p0, c0 = BRAND_STOPS[i]
        p1, c1 = BRAND_STOPS[i + 1]
        if t <= p1 or i == len(BRAND_STOPS) - 2:
            span = p1 - p0
            u = 0.0 if span == 0 else (t - p0) / span
            return mix(c0, c1, max(0.0, min(1.0, u)))
    return BRAND_STOPS[-1][1]


def horizontal_gradient(
    w: int,
    h: int,
    c0: tuple[int, int, int],
    c1: tuple[int, int, int],
) -> Image.Image:
    xs = np.linspace(0.0, 1.0, w, dtype=np.float32)
    lut = np.array([mix(c0, c1, float(x)) for x in xs], dtype=np.uint8)
    rgb = np.repeat(lut[np.newaxis, :, :], h, axis=0)
    return Image.fromarray(rgb, "RGB")


def brand_gradient(w: int, h: int) -> Image.Image:
    angle = math.radians(129.34)
    dx, dy = math.sin(angle), -math.cos(angle)
    xs = np.linspace(0.0, 1.0, w, dtype=np.float32)
    ys = np.linspace(0.0, 1.0, h, dtype=np.float32)
    grid_x, grid_y = np.meshgrid(xs, ys)
    proj = grid_x * dx + grid_y * dy
    pmin, pmax = float(proj.min()), float(proj.max())
    t = (proj - pmin) / (pmax - pmin)
    lut = np.array([brand_color_at(i / 1023) for i in range(1024)], dtype=np.uint8)
    idx = np.clip((t * 1023).astype(np.int32), 0, 1023)
    return Image.fromarray(lut[idx], "RGB")


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
    return ImageFont.truetype(str(FONTS / name), size)


def tracked_mask(text: str, font: ImageFont.FreeTypeFont, tracking: float) -> Image.Image:
    glyphs: list[tuple[str, int]] = []
    for ch in text:
        box = font.getbbox(ch)
        glyphs.append((ch, box[2] - box[0]))
    width = int(sum(w for _, w in glyphs) + tracking * max(0, len(glyphs) - 1) + 8)
    ascent, descent = font.getmetrics()
    height = ascent + descent + 8
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    x = 2
    for i, (ch, gw) in enumerate(glyphs):
        draw.text((x, 2), ch, font=font, fill=255)
        x += gw + (tracking if i < len(glyphs) - 1 else 0)
    return mask


def glyph_offset(text: str, index: int, font: ImageFont.FreeTypeFont, tracking: float) -> int:
    x = 2
    for i, ch in enumerate(text):
        if i == index:
            return x
        box = font.getbbox(ch)
        x += (box[2] - box[0]) + tracking
    return x


def paint_mask(mask: Image.Image, fill: Image.Image | tuple[int, int, int]) -> Image.Image:
    if isinstance(fill, tuple):
        color = Image.new("RGB", mask.size, fill)
    else:
        color = fill.resize(mask.size, Image.Resampling.BILINEAR)
    out = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    out.paste(color, (0, 0))
    out.putalpha(mask)
    return out


def cover(src: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / src.width, h / src.height)
    nw, nh = round(src.width * scale), round(src.height * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = 0
    return resized.crop((left, top, left + w, top + h))


def px(value: float) -> int:
    return round(value * SCALE)


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / "tmp-og-catalog"
    tmp.mkdir(exist_ok=True)

    studio = Image.open(HOME / "studio-bg.webp").convert("RGB")
    canvas = cover(studio, W, H).convert("RGBA")

    blob_png = tmp / "blob.png"
    rasterize_svg(HOME / "hero-blob.svg", blob_png, px(1610), px(818))
    blob = Image.open(blob_png).convert("RGBA")
    canvas.alpha_composite(blob, (px(-80), px(-40)))

    phone = Image.open(HOME / "hero-phone.webp").convert("RGBA")
    phone_h = px(800)
    phone_scale = phone_h / phone.height
    phone = phone.resize(
        (round(phone.width * phone_scale), phone_h),
        Image.Resampling.LANCZOS,
    )
    canvas.alpha_composite(phone, (px(-110), H - phone_h + px(36)))

    veil_px = np.zeros((H, W, 4), dtype=np.uint8)
    start = px(480)
    for x in range(start, W):
        t = (x - start) / (W - start)
        a = int(72 * (t**1.1))
        veil_px[:, x, 0] = 255
        veil_px[:, x, 1] = 255
        veil_px[:, x, 2] = 255
        veil_px[:, x, 3] = a
    canvas.alpha_composite(Image.fromarray(veil_px, "RGBA"))

    semi = load_font("Involve-SemiBold.ttf", px(72))
    bold = load_font("Involve-Bold.ttf", px(76))
    medium = load_font("Involve-Medium.ttf", px(22))
    bubble_font = load_font("Involve-Regular.ttf", px(18))
    bubble_bold = load_font("Involve-Bold.ttf", px(18))

    tracking = px(-2.8)
    text_x = px(560)
    y = px(78)

    kicker = tracked_mask("ДМИТРИЙ ВАСИН", medium, px(3.2))
    canvas.alpha_composite(paint_mask(kicker, PLUM), (text_x, y))
    y += kicker.height + px(18)

    look = "СМОТРИ."
    look_mask = tracked_mask(look, semi, tracking)
    look_img = paint_mask(
        look_mask,
        horizontal_gradient(look_mask.width, look_mask.height, PLUM, PLUM_MID),
    )
    canvas.alpha_composite(look_img, (text_x, y))

    eye_png = tmp / "eye.png"
    eye_size = px(34)
    rasterize_svg(HOME / "icon-look.svg", eye_png, eye_size, eye_size)
    eye = Image.open(eye_png).convert("RGBA")
    o_x = glyph_offset(look, 2, semi, tracking)
    o_w = semi.getbbox("О")[2] - semi.getbbox("О")[0]
    eye_x = text_x + o_x + (o_w - eye_size) // 2
    eye_y = y + px(18)
    canvas.alpha_composite(eye, (eye_x, eye_y))
    y += look_mask.height + px(4)

    repeat = "ПОВТОРЯЙ."
    repeat_mask = tracked_mask(repeat, semi, tracking)
    ghost = paint_mask(repeat_mask, PLUM)
    ghost.putalpha(ghost.getchannel("A").point(lambda a: int(a * 0.28)))
    ghost = ghost.rotate(-0.2, resample=Image.Resampling.BICUBIC, expand=True)
    live = paint_mask(
        repeat_mask,
        horizontal_gradient(repeat_mask.width, repeat_mask.height, PLUM, PLUM_MID),
    )
    live = live.rotate(-3.0, resample=Image.Resampling.BICUBIC, expand=True)
    canvas.alpha_composite(ghost, (text_x + px(8), y + px(6)))
    canvas.alpha_composite(live, (text_x, y))

    q_bl = tmp / "q-bl.png"
    q_tr = tmp / "q-tr.png"
    rasterize_svg(HOME / "deco-quote.svg", q_bl, px(26), px(26))
    rasterize_svg(HOME / "deco-quote-tr.svg", q_tr, px(30), px(28))
    canvas.alpha_composite(
        Image.open(q_bl).convert("RGBA"),
        (text_x - px(18), y + px(52)),
    )
    canvas.alpha_composite(
        Image.open(q_tr).convert("RGBA"),
        (text_x + repeat_mask.width - px(8), y - px(4)),
    )
    y += live.height + px(18)

    dance = "ТАНЦУЙ!"
    dance_mask = tracked_mask(dance, bold, tracking)
    dance_img = paint_mask(dance_mask, brand_gradient(dance_mask.width, dance_mask.height))
    canvas.alpha_composite(dance_img, (text_x + px(8), y))
    y += dance_mask.height + px(28)

    bubble_w, bubble_h = px(520), px(88)
    bubble = Image.new("RGBA", (bubble_w + px(24), bubble_h + px(24)), (0, 0, 0, 0))
    shadow = ImageDraw.Draw(bubble)
    shadow.rounded_rectangle(
        (px(8), px(10), bubble_w + px(8), bubble_h + px(10)),
        radius=px(20),
        fill=(0, 0, 0, 28),
    )
    bubble = bubble.filter(ImageFilter.GaussianBlur(px(6)))
    card = ImageDraw.Draw(bubble)
    card.rounded_rectangle(
        (0, 0, bubble_w, bubble_h),
        radius=px(20),
        fill=WHITE,
    )
    lead = "Включай обучающие видео"
    rest = "из любой точки мира — в своём темпе."
    card.text((px(22), px(18)), lead, font=bubble_bold, fill=TEXT)
    card.text((px(22), px(46)), rest, font=bubble_font, fill=TEXT)
    canvas.alpha_composite(bubble, (text_x, y))

    rgb = canvas.convert("RGB").resize((1200, 630), Image.Resampling.LANCZOS)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=70, threshold=2))
    rgb.save(OUT, "PNG", optimize=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
