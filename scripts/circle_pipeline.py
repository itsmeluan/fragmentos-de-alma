#!/usr/bin/env python3
"""Pipeline completo para círculos de transmutação: remove_bg + compressão Y."""
import sys
import os
from PIL import Image

RARITIES = ['comum', 'incomum', 'raro', 'epico', 'lendario', 'unico']
BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'app', 'fragmentos-de-alma', 'assets', 'sprites', 'circles')
Y_SCALE = 0.684
BOTTOM_MARGIN = 30
CANVAS = 256


def remove_background(img, tolerance=25):
    img = img.convert('RGBA')
    w, h = img.size
    pixels = img.load()

    corners = [pixels[0,0][:3], pixels[w-1,0][:3], pixels[0,h-1][:3], pixels[w-1,h-1][:3]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    print(f"  bg detectado: RGB{bg}")

    def similar(px):
        return all(abs(int(px[i]) - int(bg[i])) <= tolerance for i in range(3))

    visited = set()
    stack = [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]
    while stack:
        x, y = stack.pop()
        if (x,y) in visited or x<0 or x>=w or y<0 or y>=h:
            continue
        if not similar(pixels[x,y]):
            continue
        visited.add((x,y))
        pixels[x,y] = (0,0,0,0)
        stack += [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]

    removed = len(visited)
    print(f"  pixels removidos: {removed}/{w*h} ({removed/(w*h)*100:.1f}%)")
    return img


def compress_y(img):
    """Redimensiona Y * Y_SCALE e reposiciona na base do canvas."""
    img = img.convert('RGBA')
    w, h = img.size

    # Bounding box do conteúdo não-transparente
    bbox = img.getbbox()
    if not bbox:
        print("  aviso: imagem totalmente transparente após remove_bg")
        return img

    content = img.crop(bbox)
    cw, ch = content.size
    new_h = max(1, int(ch * Y_SCALE))
    content_resized = content.resize((cw, new_h), Image.NEAREST)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    paste_x = (CANVAS - cw) // 2
    paste_y = CANVAS - new_h - BOTTOM_MARGIN
    canvas.paste(content_resized, (paste_x, paste_y), content_resized)

    print(f"  conteúdo original: {cw}×{ch}  →  comprimido: {cw}×{new_h}  em ({paste_x},{paste_y})")
    return canvas


def process(rarity, tolerance=25):
    folder = os.path.join(BASE_DIR, rarity)
    raw = os.path.join(folder, 'base_raw.png')
    nobg = os.path.join(folder, 'base_nobg.png')
    final = os.path.join(folder, 'base.png')

    if not os.path.exists(raw):
        print(f"[{rarity}] SKIP — base_raw.png não encontrado")
        return False

    print(f"[{rarity}] removendo fundo...")
    img = Image.open(raw)
    img_nobg = remove_background(img, tolerance)
    img_nobg.save(nobg)

    print(f"[{rarity}] comprimindo eixo Y ({Y_SCALE})...")
    img_final = compress_y(img_nobg)
    img_final.save(final)
    print(f"[{rarity}] ✓ salvo em {final}")
    return True


if __name__ == '__main__':
    targets = sys.argv[1:] if len(sys.argv) > 1 else RARITIES
    ok = 0
    for r in targets:
        if process(r):
            ok += 1
    print(f"\nPipeline concluído: {ok}/{len(targets)} raridades processadas.")
