#!/usr/bin/env python3
"""Process user-provided CLEAN mascot assets (already background-removed):
- mascot-clean.png : sticker sheet 5x2 -> slice into 10 individual poses
- mascot-main.png  : group shot of 4 characters -> main About image + box character
"""
from PIL import Image
import numpy as np
import os, json
from collections import deque

SRC = '/home/z/my-project/mascot-clean'
OUT = '/home/z/my-project/public/brand'

def load_rgba(p):
    return Image.open(p).convert('RGBA')

def keep_largest_component(img):
    arr = np.array(img)
    h, w = arr.shape[:2]
    opaque = arr[..., 3] > 40
    visited = np.zeros((h, w), dtype=bool)
    best = []
    for sy in range(h):
        for sx in range(w):
            if opaque[sy, sx] and not visited[sy, sx]:
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
        arr[..., 3][opaque & ~keep] = 0
    return Image.fromarray(arr)

def trim(img, pad=14, thresh=25):
    a = np.array(img)[..., 3]
    ys, xs = np.where(a > thresh)
    if len(xs) == 0:
        return img
    x0, x1 = max(0, xs.min()-pad), min(img.width, xs.max()+pad)
    y0, y1 = max(0, ys.min()-pad), min(img.height, ys.max()+pad)
    return img.crop((x0, y0, x1, y1))

def save_opt(img, path, max_dim=None):
    if max_dim and max(img.size) > max_dim:
        img = img.copy()
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    q = img.quantize(colors=256, method=Image.FASTOCTREE)
    q.save(path, optimize=True)
    print(f'  {os.path.basename(path)} {img.size} {os.path.getsize(path)//1024}KB')
    return img

# ---------- 1. sticker sheet ----------
sheet = load_rgba(f'{SRC}/mascot-clean.png')
W, H = sheet.size
print(f'sticker sheet: {W}x{H}, alpha-transparent: {np.array(sheet)[...,3].min() == 0}')
cols, rows = 5, 2
names = [
    'mascot-thumbs',  # 0: jempol
    'mascot-point',   # 1: tunjuk ganda, kedip
    'mascot-tea',     # 2: bawa teh + jempol
    'mascot-jump',    # 3: lompat girang
    'mascot-box',     # 4: gendong platter box, kedip
    'mascot-cool',    # 5: kacamata hitam
    'mascot-heart',   # 6: peluk hati
    'mascot-quiet',   # 7: celetuk jari
    'mascot-sit',     # 8: duduk bawa teh
    'mascot-sign',    # 9: papan Mix, Sip, Enjoy!
]
cw, ch = W // cols, H // rows
dims = {}
for idx, name in enumerate(names):
    r_, c_ = idx // cols, idx % cols
    cell = sheet.crop((c_*cw, r_*ch, (c_+1)*cw, (r_+1)*ch))
    cell = keep_largest_component(cell)
    cell = trim(cell, pad=12)
    saved = save_opt(cell, f'{OUT}/{name}.png', max_dim=460)
    dims[name] = {'w': saved.size[0] if False else cell.size[0], 'h': cell.size[1]}
print(json.dumps(dims))

# ---------- 2. group shot -> About main image ----------
grp = load_rgba(f'{SRC}/mascot-main.png')
print(f'group shot: {grp.size}')
grp_small = grp.copy()
grp_small.thumbnail((1000, 1000), Image.LANCZOS)
grp_q = grp_small.quantize(colors=256, method=Image.FASTOCTREE)
grp_q.save(f'{OUT}/mascot-group.png', optimize=True)
print(f'  mascot-group.png {grp_small.size} {os.path.getsize(f"{OUT}/mascot-group.png")//1024}KB')

# ---------- 3. box character (rightmost of group) ----------
gw, gh = grp.size
box = grp.crop((int(gw*0.70), 0, gw, gh))
box = keep_largest_component(box)
box = trim(box, pad=10)
save_opt(box, f'{OUT}/mascot-boxchar.png', max_dim=420)
print('DONE')
