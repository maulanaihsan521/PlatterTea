#!/usr/bin/env python3
"""Process PlatterTea logo v2: flood-fill based background removal."""
from PIL import Image
from collections import deque
import sys
sys.setrecursionlimit(100000)

SRC = '/tmp/plattertea/logo.png'
OUT_FULL = '/home/z/my-project/public/brand/logo.png'
OUT_WHITE = '/home/z/my-project/public/brand/logo-white.png'
OUT_MARK = '/home/z/my-project/public/brand/logo-mark.png'
OUT_MARK_WHITE = '/home/z/my-project/public/brand/logo-mark-white.png'

img = Image.open(SRC).convert('RGB')
w, h = img.size
src = img.load()

out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
dst = out.load()

def is_light(r, g, b):
    return r >= 210 and g >= 210 and b >= 210 and (max(r, g, b) - min(r, g, b)) <= 25

# Build light mask
light = [[False] * w for _ in range(h)]
for y in range(h):
    for x in range(w):
        r, g, b = src[x, y]
        light[y][x] = is_light(r, g, b)

# BFS from border through light mask -> background
bg = [[False] * w for _ in range(h)]
q = deque()
for x in range(w):
    if light[0][x]: q.append((x, 0))
    if light[h-1][x]: q.append((x, h-1))
for y in range(h):
    if light[y][0]: q.append((0, y))
    if light[y][w-1]: q.append((w-1, y))

while q:
    x, y = q.popleft()
    if x < 0 or x >= w or y < 0 or y >= h or bg[y][x] or not light[y][x]:
        continue
    bg[y][x] = True
    q.extend(((x+1, y), (x-1, y), (x, y+1), (x, y-1)))

print('Border-connected background:', sum(sum(1 for x in range(w) if bg[y][x]) for y in range(h)))

# Enclosed light regions: remove if checkerboard (contains gray 225-246), keep if pure white
visited = [[False] * w for _ in range(h)]
for y in range(h):
    for x in range(w):
        if light[y][x] and not bg[y][x] and not visited[y][x]:
            region = []
            q2 = deque([(x, y)])
            visited[y][x] = True
            has_gray = False
            while q2:
                cx, cy = q2.popleft()
                region.append((cx, cy))
                r, g, b = src[cx, cy]
                if 225 <= min(r, g, b) <= 246 and (max(r, g, b) - min(r, g, b)) <= 12:
                    has_gray = True
                for nx, ny in ((cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)):
                    if 0 <= nx < w and 0 <= ny < h and light[ny][nx] and not visited[ny][nx] and not bg[ny][nx]:
                        visited[ny][nx] = True
                        q2.append((nx, ny))
            if has_gray:
                for cx, cy in region:
                    bg[cy][cx] = True

print('After enclosed-region removal:', sum(sum(1 for x in range(w) if bg[y][x]) for y in range(h)))

# Apply: transparent for bg, opaque otherwise
for y in range(h):
    for x in range(w):
        r, g, b = src[x, y]
        dst[x, y] = (r, g, b, 0 if bg[y][x] else 255)

# Halo cleanup: 2 passes, light pixels near transparent lose alpha
for _ in range(2):
    updates = []
    for y in range(h):
        for x in range(w):
            p = dst[x, y]
            if p[3] == 0:
                continue
            r, g, b, a = p
            if not is_light(r, g, b):
                continue
            tcount = 0
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and dst[nx, ny][3] == 0:
                    tcount += 1
            if tcount >= 2:
                updates.append((x, y, max(0, a - 150)))
            elif tcount == 1:
                updates.append((x, y, max(0, a - 70)))
    for x, y, na in updates:
        r, g, b, _ = dst[x, y]
        dst[x, y] = (r, g, b, na)

out.save(OUT_FULL)
print(f'Saved {OUT_FULL}')

# White version
white_ver = out.copy()
wp = white_ver.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = wp[x, y]
        if a == 0:
            continue
        if g > r and b > r and g < 130 and r < 90:
            wp[x, y] = (247, 243, 233, a)
white_ver.save(OUT_WHITE)
print(f'Saved {OUT_WHITE}')

# Mark crop
min_x, min_y, max_x, max_y = w, h, 0, 0
for y in range(int(h * 0.62)):
    for x in range(w):
        if dst[x, y][3] > 60:
            min_x = min(min_x, x); min_y = min(min_y, y)
            max_x = max(max_x, x); max_y = max(max_y, y)
pad = 8
box = (max(0, min_x - pad), max(0, min_y - pad), min(w, max_x + pad), min(h, max_y + pad))
mark = out.crop(box)
mark.save(OUT_MARK)
mark_white = white_ver.crop(box)
mark_white.save(OUT_MARK_WHITE)
print(f'Saved marks size={mark.size}')

# Favicon
fav = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
m = mark.copy()
m.thumbnail((224, 224))
fav.paste(m, ((256 - m.width) // 2, (256 - m.height) // 2), m)
fav.save('/home/z/my-project/public/brand/favicon.png')
ico = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
m32 = mark.copy()
m32.thumbnail((30, 30))
ico.paste(m32, ((32 - m32.width) // 2, (32 - m32.height) // 2), m32)
ico.save('/home/z/my-project/src/app/favicon.ico', sizes=[(32, 32)])
print('DONE')
