import requests
from xml.etree.ElementTree import Element, SubElement, tostring
import os

USER = "ZuriKo83"
W, H = 53, 7
CELL = 12

PALETTE = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]

def level(v):
    if v == 0: return 0
    if v < 3: return 1
    if v < 6: return 2
    if v < 10: return 3
    return 4

def get_grid():
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    res = requests.get(
        f"https://github.com/users/{USER}/contributions",
        headers=headers
    )

    html = res.text
    parts = html.split('data-count="')[1:]

    g = [[0]*W for _ in range(H)]

    for i, part in enumerate(parts):
        try:
            v = int(part.split('"')[0])
        except:
            v = 0

        x, y = i % W, i // W
        if y < H:
            g[y][x] = v

    return g

def path():
    p = []
    for x in range(W):
        col = range(H) if x % 2 == 0 else range(H-1, -1, -1)
        for y in col:
            p.append((x, y))
    return p

def simulate(grid):
    p = path()
    frames = []
    snake = []
    eaten = set()

    for pos in p:
        x, y = pos
        snake.append(pos)

        if grid[y][x] > 0 and pos not in eaten:
            eaten.add(pos)
        else:
            if len(snake) > 1:
                snake.pop(0)

        frames.append((list(snake), set(eaten)))

    frames.append(([(0,0)], set()))
    return frames

def make_svg(grid, frames):
    svg = Element("svg", width=str(W*CELL), height=str(H*CELL),
                  xmlns="http://www.w3.org/2000/svg")

    for i, (snake, eaten) in enumerate(frames):
        g = SubElement(svg, "g", id=f"f{i}", visibility="hidden")

        for y in range(H):
            for x in range(W):
                if (x, y) in eaten:
                    continue
                color = PALETTE[level(grid[y][x])]
                SubElement(g, "rect",
                           x=str(x*CELL),
                           y=str(y*CELL),
                           width=str(CELL-2),
                           height=str(CELL-2),
                           fill=color)

        for (x, y) in snake:
            SubElement(g, "rect",
                       x=str(x*CELL),
                       y=str(y*CELL),
                       width=str(CELL-2),
                       height=str(CELL-2),
                       fill="#ff3b3b")

    script = SubElement(svg, "script")
    script.text = f"""
    let start=Date.now(), total={len(frames)};
    setInterval(()=>{
      let f=Math.floor((Date.now()-start)/120)%total;
      for(let i=0;i<total;i++)
        document.getElementById('f'+i).setAttribute('visibility','hidden');
      document.getElementById('f'+f).setAttribute('visibility','visible');
    },120);
    """

    return tostring(svg).decode()

if __name__ == "__main__":
    grid = get_grid()
    frames = simulate(grid)
    svg = make_svg(grid, frames)

    os.makedirs("dist", exist_ok=True)
    with open("dist/snake.svg", "w") as f:
        f.write(svg)
