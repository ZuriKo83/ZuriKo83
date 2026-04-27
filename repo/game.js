const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 20;
let snake = [{x:10,y:10}];
let food = spawnFood();
let dx = 1, dy = 0;

function spawnFood(){
  return {
    x: Math.floor(Math.random()*20),
    y: Math.floor(Math.random()*20)
  };
}

function draw(){
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0,0,400,400);

  ctx.fillStyle = "#ff3b3b";
  ctx.fillRect(food.x*size, food.y*size, size-2, size-2);

  ctx.fillStyle = "#22c55e";
  snake.forEach(s=>{
    ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
  });

  let head = {x: snake[0].x + dx, y: snake[0].y + dy};

  if(head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20){
    snake = [{x:10,y:10}];
    food = spawnFood();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    food = spawnFood();
  } else {
    snake.pop();
  }
}

setInterval(draw, 100);

document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && dy===0){dx=0;dy=-1;}
  if(e.key==="ArrowDown" && dy===0){dx=0;dy=1;}
  if(e.key==="ArrowLeft" && dx===0){dx=-1;dy=0;}
  if(e.key==="ArrowRight" && dx===0){dx=1;dy=0;}
});
