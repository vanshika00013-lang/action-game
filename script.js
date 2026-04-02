const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let margin = 50;

// PLAYER
let player = {
  x: canvas.width/2,
  y: canvas.height/2,
  size: 20,
  speed: 5,
  hp: 100,
  rapid: false
};

let bullets = [];
let enemies = [];
let powerups = [];
let particles = [];

let boss = null;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;

let keys = {};

let shootSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");

// CONTROLS
document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if(gameOver && e.key === "Enter"){
    location.reload();
  }
});
document.addEventListener("keyup", e => keys[e.key] = false);

// SHOOT
document.addEventListener("click", e => {
  shootSound.play();

  bullets.push({
    x: player.x,
    y: player.y,
    dx: (e.clientX - player.x)/15,
    dy: (e.clientY - player.y)/15
  });
});

// ENEMY SPAWN
setInterval(()=>{
  if(!gameOver){
    enemies.push({
      x: Math.random()*(canvas.width-margin*2)+margin,
      y: Math.random()*(canvas.height-margin*2)+margin,
      size: 15,
      speed: 1 + score/200
    });
  }
},1000);

// POWERUPS (FIXED)
setInterval(()=>{
  let types = ["health","speed","rapid"];
  powerups.push({
    x: Math.random()*(canvas.width-margin*2)+margin,
    y: Math.random()*(canvas.height-margin*2)+margin,
    size: 15,
    type: types[Math.floor(Math.random()*3)]
  });
},6000);

// BOSS
setInterval(()=>{
  if(score > 100 && !boss){
    boss = {
      x: canvas.width/2,
      y: 100,
      size: 50,
      hp: 200
    };
  }
},2000);

// PARTICLES
function createExplosion(x,y,color){
  for(let i=0;i<10;i++){
    particles.push({
      x,y,
      dx: (Math.random()-0.5)*4,
      dy: (Math.random()-0.5)*4,
      life: 20,
      color
    });
  }
}

// HEART DRAW
function drawHeart(x,y){
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x, y-10, x-15, y-10, x-15, y);
  ctx.bezierCurveTo(x-15, y+10, x, y+15, x, y+20);
  ctx.bezierCurveTo(x, y+15, x+15, y+10, x+15, y);
  ctx.bezierCurveTo(x+15, y-10, x, y-10, x, y);
  ctx.fill();
}

// LOOP
function gameLoop(){
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(gameOver){
    ctx.fillStyle = "red";
    ctx.font = "50px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    ctx.font = "20px Arial";
    ctx.fillText("Press ENTER to Restart", canvas.width/2 - 120, canvas.height/2 + 40);
    return;
  }

  // MOVE
  if(keys["w"]) player.y -= player.speed;
  if(keys["s"]) player.y += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  ctx.fillStyle = "purple";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // BULLETS
  ctx.fillStyle = "orange";
  bullets.forEach((b,i)=>{
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillRect(b.x,b.y,5,5);
  });

  // ENEMIES
  ctx.fillStyle = "green";
  enemies.forEach((e,ei)=>{
    let angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle)*e.speed;
    e.y += Math.sin(angle)*e.speed;

    ctx.fillRect(e.x,e.y,e.size,e.size);

    if(Math.abs(player.x - e.x) < 20 && Math.abs(player.y - e.y) < 20){
      player.hp -= 1;
    }

    bullets.forEach((b,bi)=>{
      if(Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15){
        createExplosion(e.x,e.y,"orange");
        enemies.splice(ei,1);
        bullets.splice(bi,1);
        score += 10;
      }
    });
  });

  // POWERUPS
  powerups.forEach((p,pi)=>{
    if(p.type === "health") drawHeart(p.x,p.y);
    if(p.type === "speed"){
      ctx.fillStyle="cyan";
      ctx.fillRect(p.x,p.y,15,15);
    }
    if(p.type === "rapid"){
      ctx.fillStyle="yellow";
      ctx.fillRect(p.x,p.y,15,15);
    }

    if(Math.abs(player.x - p.x) < 20 && Math.abs(player.y - p.y) < 20){
      if(p.type === "health") player.hp += 20;
      if(p.type === "speed") player.speed = 8;
      if(p.type === "rapid") player.rapid = true;
      powerups.splice(pi,1);
    }
  });

  // UI
  ctx.fillStyle="white";
  ctx.fillText("Score: "+score,20,20);
  ctx.fillText("HP: "+player.hp,20,40);
  ctx.fillText("High: "+highScore,20,60);

  if(score > highScore){
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  if(player.hp <= 0){
    gameOver = true;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();