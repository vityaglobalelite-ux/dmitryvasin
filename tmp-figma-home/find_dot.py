from PIL import Image

im = Image.open("public/assets/site/home/deco-arrow.png").convert("RGBA")
px = im.load()
xs, ys, n = 0, 0, 0
# right-top quadrant: the start dot
for y in range(im.height // 3):
    for x in range(im.width * 2 // 3, im.width):
        r, g, b, a = px[x, y]
        if a > 200 and r > 160 and g < 120 and b < 80 and r > g + 40:
            xs += x
            ys += y
            n += 1
print("png", im.size, "dot", None if not n else (xs / n, ys / n, n))
