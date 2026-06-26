#!/usr/bin/env python3
"""Remove background cor sólida de PNG via flood-fill a partir dos cantos."""
import sys
from PIL import Image

def remove_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    pixels = img.load()

    # Cor de fundo = média dos 4 cantos
    corners = [pixels[0,0][:3], pixels[w-1,0][:3], pixels[0,h-1][:3], pixels[w-1,h-1][:3]]
    bg = tuple(sum(c[i] for c in corners)//4 for i in range(3))
    print(f"Cor de fundo detectada: RGB{bg}")

    def similar(px):
        return all(abs(int(px[i]) - int(bg[i])) <= tolerance for i in range(3))

    # Flood-fill BFS a partir dos 4 cantos
    visited = set()
    queue = [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]
    for start in queue:
        if start not in visited and similar(pixels[start[0]][start[1]] if False else pixels[start[0],start[1]]):
            stack = [start]
            while stack:
                x, y = stack.pop()
                if (x,y) in visited or x<0 or x>=w or y<0 or y>=h:
                    continue
                if not similar(pixels[x,y]):
                    continue
                visited.add((x,y))
                pixels[x,y] = (0,0,0,0)
                stack += [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]

    img.save(output_path)
    removed = len(visited)
    print(f"Pixels removidos: {removed} / {w*h} ({removed/(w*h)*100:.1f}%)")
    print(f"Salvo em: {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python3 remove_bg.py input.png output.png [tolerance]")
        sys.exit(1)
    tol = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    remove_background(sys.argv[1], sys.argv[2], tol)
