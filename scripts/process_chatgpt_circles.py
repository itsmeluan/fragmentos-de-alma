#!/usr/bin/env python3
"""Pipeline para círculos do ChatGPT: remove bg + perspectiva X (Y compression)."""
import sys
import os
from PIL import Image

SRC = '/Users/martinsluan/Downloads/Circulos'
DST_BASE = '/Volumes/SSDLuan/Projetos/Fragmentos_de_Alma/app/fragmentos-de-alma/assets/sprites/circles'

FILES = {
    'comum':    'circulo comum.png',
    'incomum':  'circulo incomum.png',
    'raro':     'circulo raro.png',
    'epico':    'circulo epico.png',
    'lendario': 'circulo lendário.png',
    'unico':    'circulo único.png',
}

CANVAS = 256
Y_SCALE = 0.420      # ratio H/W medido da base circular de referência
CIRCLE_WIDTH = 220   # largura alvo dentro do canvas (18px margem em cada lado)
BOTTOM_MARGIN = 12   # distância do fundo do canvas


def remove_bg(img, tolerance=20):
    """Flood-fill BFS nos 4 cantos para remover fundo escuro."""
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()

    # Cor de fundo = média dos 4 cantos (ignorando alpha)
    corners = [px[0,0][:3], px[w-1,0][:3], px[0,h-1][:3], px[w-1,h-1][:3]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    print(f"  bg detectado: RGB{bg}")

    def similar(p):
        return all(abs(int(p[i]) - int(bg[i])) <= tolerance for i in range(3))

    visited = set()
    stack = [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]
    while stack:
        x, y = stack.pop()
        if (x,y) in visited or x < 0 or x >= w or y < 0 or y >= h:
            continue
        if not similar(px[x,y]):
            continue
        visited.add((x,y))
        px[x,y] = (0, 0, 0, 0)
        stack += [(x+1,y), (x-1,y), (x,y+1), (x,y-1)]

    removed = len(visited)
    total = w * h
    print(f"  pixels removidos: {removed}/{total} ({removed/total*100:.1f}%)")
    return img


def apply_perspective(img):
    """Recorta o conteúdo, escala para CIRCLE_WIDTH, comprime Y, posiciona no canvas."""
    bbox = img.getbbox()
    if not bbox:
        print("  AVISO: imagem vazia após remove_bg")
        return img

    content = img.crop(bbox)
    cw, ch = content.size
    print(f"  content original: {cw}×{ch}")

    # Escala para largura alvo mantendo aspecto
    scale = CIRCLE_WIDTH / cw
    scaled_w = CIRCLE_WIDTH
    scaled_h = int(ch * scale)
    content_scaled = content.resize((scaled_w, scaled_h), Image.LANCZOS)

    # Comprime Y para a perspectiva correta (rotação eixo X)
    final_h = max(1, int(scaled_h * Y_SCALE))
    content_final = content_scaled.resize((scaled_w, final_h), Image.LANCZOS)
    print(f"  após perspectiva: {scaled_w}×{final_h} (ratio H/W={final_h/scaled_w:.3f})")

    # Posiciona no canvas 256×256 — centralizado, ancorado na base
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    paste_x = (CANVAS - scaled_w) // 2
    paste_y = CANVAS - final_h - BOTTOM_MARGIN
    canvas.paste(content_final, (paste_x, paste_y), content_final)
    print(f"  posição no canvas: ({paste_x}, {paste_y})")
    return canvas


def process(rarity):
    filename = FILES[rarity]
    src_path = os.path.join(SRC, filename)
    dst_dir = os.path.join(DST_BASE, rarity)
    os.makedirs(dst_dir, exist_ok=True)
    dst_path = os.path.join(dst_dir, 'base.png')

    if not os.path.exists(src_path):
        print(f"[{rarity}] SKIP — {filename} não encontrado")
        return False

    print(f"[{rarity}] {filename}")
    img = Image.open(src_path)

    # Se já tem transparência real nos cantos, pula remove_bg
    rgba = img.convert('RGBA')
    w, h = rgba.size
    px = rgba.load()
    corners_alpha = [px[0,0][3], px[w-1,0][3], px[0,h-1][3], px[w-1,h-1][3]]
    avg_alpha = sum(corners_alpha) / 4

    if avg_alpha < 10:
        print(f"  fundo já transparente (alpha={avg_alpha:.0f}), pulando remove_bg")
        img_nobg = rgba
    else:
        img_nobg = remove_bg(rgba, tolerance=20)

    result = apply_perspective(img_nobg)
    result.save(dst_path)
    print(f"  ✓ salvo: {dst_path}\n")
    return True


if __name__ == '__main__':
    targets = sys.argv[1:] if len(sys.argv) > 1 else list(FILES.keys())
    ok = 0
    for r in targets:
        if process(r):
            ok += 1
    print(f"Concluído: {ok}/{len(targets)} raridades.")
