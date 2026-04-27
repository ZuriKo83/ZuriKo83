import requests
import os
from xml.etree.ElementTree import Element, SubElement, tostring

USER = "ZuriKo83"
W, H = 53, 7
CELL = 12

PALETTE = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]

def get_grid():
    query = """
    {
      user(login: "%s") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
              }
            }
          }
        }
      }
    }
    """ % USER

    headers = {
        "Authorization": "Bearer %s" % os.environ.get("GITHUB_TOKEN"),
        "Content-Type": "application/json"
    }

    res = requests.post(
        "https://api.github.com/graphql",
        json={"query": query},
        headers=headers
    )

    data = res.json()

    weeks = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]

    g = [[0]*W for _ in range(H)]

    for x, week in enumerate(weeks[:W]):
        for y, day in enumerate(week["contributionDays"]):
            if y < H:
                g[y][x] = day["contributionCount"]

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
            p.append((x, y))
    return p

def simulate(grid):
    p = path()
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

    return snake, eaten

def make_svg(grid, snake, eaten):
    svg = Element("svg",
                  width=str(W*CELL),
                  height=str(H*CELL),
                  xmlns="http://www.w3.org/2000/svg")

    # 배경
    SubElement(svg, "rect",
               x="0", y="0",
               width=str(W*CELL),
               height=str(H*CELL),
               fill="#0d1117")

    # 잔디
    for y in range(H):
        for x in range(W):
            if (x, y) in eaten:
                continue
            color = PALETTE[level(grid[y][x])]
            SubElement(svg, "rect",
                       x=str(x*CELL),
                       y=str(y*CELL),
                       width=str(CELL-2),
                       height=str(CELL-2),
                       fill=color)

    # 뱀
    for (x, y) in snake:
        SubElement(svg, "rect",
                   x=str(x*CELL),
                   y=str(y*CELL),
                   width=str(CELL-2),
                   height=str(CELL-2),
                   fill="#ff3b3b")

    return tostring(svg).decode()

if __name__ == "__main__":
    grid = get_grid()
    snake, eaten = simulate(grid)
    svg = make_svg(grid, snake, eaten)

    os.makedirs("dist", exist_ok=True)
    with open("dist/snake.svg", "w") as f:
        f.write(svg)
    
