import re
from pathlib import Path

src = Path("tmp-figma-home/fig-arrow.svg").read_text(encoding="utf-8")
m = re.search(r'<path id="Vector 512" d="([^"]+)"', src)
if not m:
    raise SystemExit("path not found")
out = (
    '<svg width="75" height="84" viewBox="0 0 75 84" fill="none" '
    'xmlns="http://www.w3.org/2000/svg">\n'
    f'<path d="{m.group(1)}" fill="#C2461E"/>\n'
    "</svg>\n"
)
dest = Path("public/assets/site/home/deco-arrow-mobile.svg")
dest.write_text(out, encoding="utf-8")
print("wrote", dest, "bytes", dest.stat().st_size)
