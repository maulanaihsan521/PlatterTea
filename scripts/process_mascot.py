#!/usr/bin/env python3
"""Process PlatterTea mascot images: remove baked-in checkerboard background,
slice sticker sheet into individual poses, trim, resize, optimize."""
from PIL import Image
import numpy as np
import os, subprocess, json
from collections import deque

RAW = '/home/z/my-project/mascot-raw'
OUT = '/home/z/my-project/public/brand'
os.makedirs(OUT, exist_ok=True)

def load_rgba(path):
    return Image.open(path).convert('RGBA')

# ---------- checkerboard detection ----------
def detect_square_size(arr):
    """Scan row 0 to find alternating run lengths."""
    w = arr.shape[1]
    def classify(px):
        r, g, b = int(px[0]), int(px[1]), int(px[2])
        if r >= 246 and g >= 246 and b >= 246 and (max(r,g,b) - min(r,g,b)) <= 8:
            return 'W'
        if 210 <= r <= 249 and 210 <= g <= 249 and 210 <= b <= 249 and (max(r,g,b) - min(r,g,b)) <= 14:
            return 'G'
        return '?'
    row = [classify(arr[0, x]) for x in range(w)]
    runs = []
    cur, start = row[0], 0
    for x in range(1, w):
        if row[x] != cur:
            runs.append((cur, x - start))
            cur, start = row[x], x
    runs.append((cur, w - start))
    runs = [r for r in runs if r[0] in 'WG']
    if not runs:
        return None, None
    sizes = sorted(r[1] for r in runs)
    med = sizes[len(sizes)//2]
    # first cell parity: is cell(0,0) white or gray?
    first = runs[0][0]
    return med, first

def remove_checkerboard(img):
    """Two-tier checkerboard removal (phase-free):
    1) Full grid cells with >=93% light pixels -> mask their light pixels.
    2) Flood-extend the mask through ANY light pixel (eats checker leftovers in
       partial cells; stops at mascot outlines so enclosed whites survive)."""
    arr = np.array(img)
    h, w = arr.shape[:2]
    S, first = detect_square_size(arr)
    if S is None or S < 8:
        print('  no checkerboard detected — returning as-is')
        return img
    print(f'  checker size={S}px first_cell={first}')
    rgb = arr[..., :3].astype(np.int16)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = mx - mn
    is_light = ((r >= 208) & (sat <= 18)) | ((r >= 243) & (sat <= 12))

    # tier 1: full bg-safe cells
    bgmask = np.zeros((h, w), dtype=bool)
    ny, nx = h // S, w // S
    for cy in range(ny):
        for cx in range(nx):
            cell = is_light[cy*S:(cy+1)*S, cx*S:(cx+1)*S]
            if cell.mean() >= 0.93:
                bgmask[cy*S:(cy+1)*S, cx*S:(cx+1)*S] = is_light[cy*S:(cy+1)*S, cx*S:(cx+1)*S]
    # remainders (right/bottom edges) if uniformly light
    rem_x = w - nx*S
    if rem_x > 0:
        colfrac = is_light[:, nx*S:].mean(axis=0)
        for i, fx in enumerate(colfrac):
            if fx >= 0.93:
                bgmask[:, nx*S + i] |= is_light[:, nx*S + i]
    rem_y = h - ny*S
    if rem_y > 0:
        rowfrac = is_light[ny*S:, :].mean(axis=1)
        for i, fy in enumerate(rowfrac):
            if fy >= 0.93:
                bgmask[ny*S + i, :] |= is_light[ny*S + i, :]
    print(f'  tier1 bg px: {bgmask.mean()*100:.1f}%')

    # tier 2: flood from tier-1 mask through any light pixel (4-connectivity)
    visited = bgmask.copy()
    q = deque()
    ys, xs = np.where(bgmask)
    for y, x in zip(ys[::7], xs[::7]):  # seed every 7th px for speed
        q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny2, nx2 = y+dy, x+dx
            if 0 <= ny2 < h and 0 <= nx2 < w and is_light[ny2, nx2] and not visited[ny2, nx2]:
                visited[ny2, nx2] = True
                q.append((ny2, nx2))
    final_bg = visited
    print(f'  background px: {final_bg.mean()*100:.1f}%')

    alpha = np.where(final_bg, 0, 255).astype(np.uint8)
    out = arr.copy()
    out[..., 3] = alpha

    # halo cleanup: light opaque pixels with many transparent neighbors lose alpha
    for _ in range(3):
        a = out[..., 3]
        trans = (a == 0)
        tcount = np.zeros((h, w), dtype=np.int16)
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            shifted = np.roll(trans, (dy, dx), axis=(0, 1))
            tcount += shifted
        light_opaque = (a > 0) & ((r >= 210) & (sat <= 20))
        strong = light_opaque & (tcount >= 2)
        weak = light_opaque & (tcount == 1)
        out[..., 3][strong] = np.maximum(0, out[..., 3][strong].astype(np.int16) - 140).astype(np.uint8)
        out[..., 3][weak] = np.maximum(0, out[..., 3][weak].astype(np.int16) - 60).astype(np.uint8)
    return Image.fromarray(out)

def trim(img, pad=12, thresh=25):
    a = np.array(img)[..., 3]
    ys, xs = np.where(a > thresh)
    if len(xs) == 0:
        return img
    x0, x1 = max(0, xs.min()-pad), min(img.width, xs.max()+pad)
    y0, y1 = max(0, ys.min()-pad), min(img.height, ys.max()+pad)
    return img.crop((x0, y0, x1, y1))

def keep_largest_component(img):
    """Keep only the largest connected opaque component (drops neighbor-sticker bleed)."""
    arr = np.array(img)
    h, w = arr.shape[:2]
    opaque = arr[..., 3] > 40
    visited = np.zeros((h, w), dtype=bool)
    best = []
    for sy in range(h):
        row = opaque[sy]
        if not row.any():
            continue
        for sx in range(w):
            if row[sx] and not visited[sy, sx]:
                comp = []
                q = deque([(sy, sx)])
                visited[sy, sx] = True
                while q:
                    y, x = q.popleft()
                    comp.append((y, x))
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny, nx = y+dy, x+dx
                        if 0 <= ny < h and 0 <= nx < w and opaque[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                if len(comp) > len(best):
                    best = comp
    if best and len(best) < int(opaque.sum()):
        keep = np.zeros((h, w), dtype=bool)
        for y, x in best:
            keep[y, x] = True
        drop = opaque & ~keep
        arr[..., 3][drop] = 0
    return Image.fromarray(arr)

def save_opt(img, path, max_dim=None):
    if max_dim and max(img.size) > max_dim:
        img = img.copy()
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    q = img.quantize(colors=256, method=Image.FASTOCTREE)
    q.save(path, optimize=True)
    print(f'  saved {path} {img.size} {os.path.getsize(path)//1024}KB')
    return img

# ---------- 1. main walking mascot ----------
print('== Mascot with Snacks (walk) ==')
walk = load_rgba(f'{RAW}/Maskot PlatterTea/PlatterTea Mascot with Snacks.png')
walk = remove_checkerboard(walk)
walk = keep_largest_component(walk)
walk = trim(walk)
save_opt(walk, f'{OUT}/mascot-walk.png', max_dim=880)

# ---------- 2. sticker sheet slicing ----------
print('== Sticker Collection (2x5 grid) ==')
sheet = load_rgba(f'{RAW}/Maskot PlatterTea/PlatterTea Mascot Sticker Collection.png')
sheet = remove_checkerboard(sheet)
W, H = sheet.size
cols, rows = 5, 2
names = [
    'mascot-thumbs',   # 0 top-left  : thumbs up (Semangat)
    'mascot-point',    # 1 top       : pointing wink (Wink)
    'mascot-tea',      # 2 top       : holding tea cup (Santai)
    'mascot-jump',     # 3 top       : jumping excited
    'mascot-box',      # 4 top-right : holding platter box
    'mascot-cool',     # 5 bottom    : sunglasses
    'mascot-heart',    # 6 bottom    : hugging heart
    'mascot-quiet',    # 7 bottom    : shushing
    'mascot-sit',      # 8 bottom    : sitting with tea
    'mascot-sign',     # 9 bottom-right : holding Mix, Sip, Enjoy! sign
]
cw, ch = W // cols, H // rows
meta = []
for idx, name in enumerate(names):
    r_, c_ = idx // cols, idx % cols
    cell = sheet.crop((c_*cw, r_*ch, (c_+1)*cw, (r_+1)*ch))
    cell = keep_largest_component(cell)
    cell = trim(cell, pad=10)
    if cell.width < 40 or cell.height < 40:
        print(f'  {name}: EMPTY cell, skipped')
        continue
    save_opt(cell, f'{OUT}/{name}.png', max_dim=460)
    meta.append({'name': name, 'w': cell.width, 'h': cell.height})
print(json.dumps(meta))

# ---------- 3. brand board (no checkerboard — designed board) ----------
print('== Brand Board ==')
bb = load_rgba(f'{RAW}/Maskot PlatterTea/PlatterTea Mascot Brand Board (1).png')
bg = Image.new('RGB', bb.size, (247, 243, 233))
bg.paste(bb, mask=bb.split()[3])
bb_small = bg.copy(); bb_small.thumbnail((900, 900), Image.LANCZOS)
bb_small.save(f'{OUT}/mascot-brandboard.jpg', optimize=True, quality=85)
print(f'  final brand board {bb_small.size} {os.path.getsize(f"{OUT}/mascot-brandboard.jpg")//1024}KB')
print('DONE')
