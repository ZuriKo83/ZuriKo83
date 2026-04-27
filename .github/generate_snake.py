import os, random
from xml.etree.ElementTree import Element, SubElement, tostring

W, H = 53, 7
CELL = 16
STEPS = 120

def gen_grid():
    return {(random.randint(0,W-1), random.randint(0,H-1)) for _ in range(80)}

def path():
    p = []
    for x in range(W):
        col = range(H) if x % 2 == 0 else range(H-1, -1, -1)
        for y in col:
            p.append((x,y))
    return p

def simulate_frames():
    p = path()
    grid = gen_grid()

    snake = []
    eaten = set()
    frames = []

    for i in range(STEPS):
        pos = p[i % len(p)]
        snake.append(pos)

        if pos in grid and pos not in eaten:
            eaten.add(pos)
        else:
            if len(snake) > 1:
                snake.pop(0)

        frames.append((list(snake), set(grid - eaten)))

        if len(eaten) > 50:
            grid = gen_grid()
            eaten.clear()
            snake = [pos]

    return frames

def make_svg(frames):
    svg = Element("svg",
        width="100%",
        height="220",
        viewBox=f"0 0 {W*CELL} {H*CELL}",
        xmlns="http://www.w3.org/2000/svg"
    )

    SubElement(svg, "rect",
        x="0", y="0",
        width=str(W*CELL),
        height=str(H*CELL),
        fill="#0d1117"
    )

    total = len(frames)
    dur = total * 0.08

    for i,(snake,food) in enumerate(frames):
        g = SubElement(svg, "g")

        # 핵심: 프레임 하나씩 켜지게
        SubElement(g, "set",
            attributeName="display",
            to="inline",
            begin=f"{i*0.08}s",
            dur="0.08s",
            repeatCount="indefinite"
        )

        SubElement(g, "set",
            attributeName="display",
            to="none",
            begin=f"{(i*0.08)+0.08}s",
            repeatCount="indefinite"
        )

        # 빨간 먹이
        for (x,y) in food:
            SubElement(g, "rect",
                x=str(x*CELL),
                y=str(y*CELL),
                width=str(CELL-2),
                height=str(CELL-2),
                fill="#ff3b3b"
            )

        # 초록 뱀
        for (x,y) in snake:
            SubElement(g, "rect",
                x=str(x*CELL),
                y=str(y*CELL),
                width=str(CELL-2),
                height=str(CELL-2),
                fill="#22c55e"
            )

    return tostring(svg).decode()

if __name__ == "__main__":
    frames = simulate_frames()
    svg = make_svg(frames)

    os.makedirs("dist", exist_ok=True)
    open("dist/snake.svg","w").write(svg)
