const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 20;
const tile = 20;

let snake = [{x:10,y:10}];
let food = spawnFood();

let dx = 1;
let dy = 0;

function spawnFood(){
  return {
    x: Math.floor(Math.random()*tile),
    y: Math.floor(Math.random()*tile)
  };
}

function reset(){
  snake = [{x:10,y:10}];
  dx = 1;
  dy = 0;
  food = spawnFood();
}

function draw(){
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0,0,400,400);

  // food
  ctx.fillStyle = "#ff3b3b";
  ctx.fillRect(food.x*size, food.y*size, size-2, size-2);

  // snake
  ctx.fillStyle = "#22c55e";
  snake.forEach(s=>{
    ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
  });

  let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // 벽 충돌 → 리셋
  if(head.x < 0 || head.y < 0 || head.x >= tile || head.y >= tile){
    reset();
    return;
  }

  // 자기 몸 충돌
  if(snake.some(s => s.x === head.x && s.y === head.y)){
    reset();
    return;
  }

  snake.unshift(head);

  // 먹기
  if(head.x === food.x && head.y === food.y){
    food = spawnFood();
  } else {
    snake.pop();
  }
}

setInterval(draw, 180);

// 방향키
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && dy===0){dx=0;dy=-1;}
  if(e.key==="ArrowDown" && dy===0){dx=0;dy=1;}
  if(e.key==="ArrowLeft" && dx===0){dx=-1;dy=0;}
  if(e.key==="ArrowRight" && dx===0){dx=1;dy=0;}
});
