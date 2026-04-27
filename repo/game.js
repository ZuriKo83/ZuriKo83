const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 20;
const tile = 20;

let snake = [{x:10,y:10}];
let dx = 1;
let dy = 0;

let foods = [];
const FOOD_COUNT = 5;

// 속도 (낮을수록 빠름, ms)
let speed = 1200;

function spawnFoods(){
  foods = [];

  while(foods.length < FOOD_COUNT){
    let f = {
      x: Math.floor(Math.random()*tile),
      y: Math.floor(Math.random()*tile)
    };

    let overlapSnake = snake.some(s => s.x === f.x && s.y === f.y);
    let overlapFood = foods.some(ff => ff.x === f.x && ff.y === f.y);

    if(!overlapSnake && !overlapFood){
      foods.push(f);
    }
  }
}

function reset(){
  snake = [{x:10,y:10}];
  dx = 1;
  dy = 0;
  spawnFoods();
}

function update(){
  let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // 벽 충돌
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

  let ate = false;

  foods = foods.filter(f=>{
    if(head.x === f.x && head.y === f.y){
      ate = true;
      return false;
    }
    return true;
  });

  if(ate){
    let newFood;
    do{
      newFood = {
        x: Math.floor(Math.random()*tile),
        y: Math.floor(Math.random()*tile)
      };
    }while(
      snake.some(s => s.x === newFood.x && s.y === newFood.y) ||
      foods.some(f => f.x === newFood.x && f.y === newFood.y)
    );

    foods.push(newFood);
  } else {
    snake.pop();
  }
}

function draw(){
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0,0,400,400);

  // 먹이 (빨강)
  ctx.fillStyle = "#ff3b3b";
  foods.forEach(f=>{
    ctx.fillRect(f.x*size, f.y*size, size-2, size-2);
  });

  // 뱀 (초록)
  ctx.fillStyle = "#22c55e";
  snake.forEach(s=>{
    ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
  });
}

// 프레임 기반 루프
let lastTime = 0;
let acc = 0;

function gameLoop(time){
  let delta = time - lastTime;
  lastTime = time;
  acc += delta;

  if(acc > speed){
    update();
    acc -= speed;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// 방향키
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && dy===0){dx=0;dy=-1;}
  if(e.key==="ArrowDown" && dy===0){dx=0;dy=1;}
  if(e.key==="ArrowLeft" && dx===0){dx=-1;dy=0;}
  if(e.key==="ArrowRight" && dx===0){dx=1;dy=0;}
});

// 시작
spawnFoods();
requestAnimationFrame(gameLoop);
