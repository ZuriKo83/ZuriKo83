import os, random
from xml.etree.ElementTree import Element, SubElement, tostring

W, H = 53, 7
CELL = 16
DENSITY = 0.35   # 잔디 밀도
STEPS = 220      # 프레임 수

PALETTE = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]

def gen_grid():
    g = [[0]*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if random.random() < DENSITY:
                g[y][x] = random.randint(1, 12)
    return g

def level(v):
    if v == 0: return 0
    if v < 3: return 1
    if v < 6: return 2
    if v < 10: return 3
    return 4

def path():
    p = []
    for x in range(W):
        col = range(H) if x % 2 == 0 else range(H-1, -1, -1)
        for y in col:
            p.append((x,y))
    return p

def simulate_frames():
    grid = gen_grid()
    p = path()
    snake, eaten = [], set()
    frames = []

    for i in range(STEPS):
        pos = p[i % len(p)]
        x,y = pos
        snake.append(pos)

        if grid[y][x] > 0 and pos not in eaten:
            eaten.add(pos)
        else:
            if len(snake) > 1:
                snake.pop(0)

        frames.append((list(snake), set(eaten), grid))

        # 다 먹으면 초기화
        if len(eaten) > W*H*0.6:
            grid = gen_grid()
            eaten.clear()
            snake = [pos]

    return frames

def make_svg(frames):
    svg = Element("svg",
                  width="100%",
                  height="220",
                  viewBox=f"0 0 {W*CELL} {H*CELL}",
                  xmlns="http://www.w3.org/2000/svg")

    SubElement(svg, "rect",
               x="0", y="0",
               width=str(W*CELL),
               height=str(H*CELL),
               fill="#0d1117")

    dur = len(frames) * 0.07

    for i,(snake,eaten,grid) in enumerate(frames):
        g = SubElement(svg, "g", opacity="0")

        SubElement(g, "animate",
                   attributeName="opacity",
                   values="0;1;0",
                   dur=f"{dur}s",
                   begin=f"{i*0.07}s",
                   repeatCount="indefinite")

        # 잔디
        for y in range(H):
            for x in range(W):
                if (x,y) in eaten:
                    continue
                color = PALETTE[level(grid[y][x])]
                SubElement(g, "rect",
                           x=str(x*CELL),
                           y=str(y*CELL),
                           width=str(CELL-2),
                           height=str(CELL-2),
                           fill=color)

        # 뱀
        for (x,y) in snake:
            SubElement(g, "rect",
                       x=str(x*CELL),
                       y=str(y*CELL),
                       width=str(CELL-2),
                       height=str(CELL-2),
                       fill="#ff3b3b")

    return tostring(svg).decode()

if __name__ == "__main__":
    frames = simulate_frames()
    svg = make_svg(frames)

    os.makedirs("dist", exist_ok=True)
    open("dist/snake.svg","w").write(svg)
