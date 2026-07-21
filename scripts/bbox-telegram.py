from pathlib import Path
import re

s = Path("public/assets/landing/social-telegram.svg").read_text(encoding="utf-8")
m = re.search(r'<path[^>]*\sd="([^"]+)"', s)
assert m
parts = re.findall(r"[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?", m.group(1))
nums = [float(x) for x in parts]
xs, ys = nums[0::2], nums[1::2]
cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
print("bbox", min(xs), min(ys), max(xs), max(ys))
print("center", cx, cy)
print("translate", 15 - cx, 15 - cy)
