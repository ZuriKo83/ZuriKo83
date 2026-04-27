const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const size = 20;
const tile = 20;

let snake = [{x:10,y:10}];
let dx = 1;
let dy = 0;

let foods = [];
const FOOD_COUNT = 5;

// 랜덤 먹이 생성 (겹침 방지)
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

function draw(){
  // 배경
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

  // 머리 이동
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

  // 먹이 먹기
  let ate = false;

  foods = foods.filter(f=>{
    if(head.x === f.x && head.y === f.y){
      ate = true;
      return false;
    }
    return true;
  });

  if(ate){
    // 먹이 하나 추가 (유지)
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

// 속도 조절 (느리게)
setInterval(draw, 120);

// 방향키
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && dy===0){dx=0;dy=-1;}
  if(e.key==="ArrowDown" && dy===0){dx=0;dy=1;}
  if(e.key==="ArrowLeft" && dx===0){dx=-1;dy=0;}
  if(e.key==="ArrowRight" && dx===0){dx=1;dy=0;}
});

// 초기 실행
spawnFoods();
