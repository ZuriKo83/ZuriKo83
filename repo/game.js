document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const size = 20;
  const tile = 20;

  let snake = [{x:10,y:10}];
  let dx = 1, dy = 0;

  let foods = [];
  const FOOD_COUNT = 5;

  let moveInterval = 150;
  let lastMove = 0;

  function spawnFoods(){
    foods = [];
    while(foods.length < FOOD_COUNT){
      const f = {
        x: Math.floor(Math.random()*tile),
        y: Math.floor(Math.random()*tile)
      };

      const overlapSnake = snake.some(s => s.x === f.x && s.y === f.y);
      const overlapFood = foods.some(ff => ff.x === f.x && ff.y === f.y);

      if(!overlapSnake && !overlapFood){
        foods.push(f);
      }
    }
  }

  function reset(){
    snake = [{x:10,y:10}];
    dx = 1; dy = 0;
    spawnFoods();
  }

  function update(){
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if(head.x < 0 || head.y < 0 || head.x >= tile || head.y >= tile){
      reset();
      return;
    }

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

    // 🔥 AI에서 접근 가능하게 노출
    window.snake = snake;
    window.foods = foods;
  }

  function draw(){
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle = "#ff3b3b";
    foods.forEach(f=>{
      ctx.fillRect(f.x*size, f.y*size, size-2, size-2);
    });

    ctx.fillStyle = "#22c55e";
    snake.forEach(s=>{
      ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
    });
  }

  function gameLoop(time){
    if(time - lastMove > moveInterval){
      update();
      lastMove = time;
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  // 🔥 외부(AI)에서 방향 변경 가능
  window.setDirection = (dir) => {
    if(dir==="ArrowUp" && dy===0){dx=0;dy=-1;}
    if(dir==="ArrowDown" && dy===0){dx=0;dy=1;}
    if(dir==="ArrowLeft" && dx===0){dx=-1;dy=0;}
    if(dir==="ArrowRight" && dx===0){dx=1;dy=0;}
  };

  spawnFoods();
  requestAnimationFrame(gameLoop);

  document.addEventListener("keydown", e=>{
    window.setDirection(e.key);
  });
});
