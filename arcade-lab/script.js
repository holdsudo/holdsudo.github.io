const selectorButtons = Array.from(document.querySelectorAll(".selector-btn"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const touchButtons = Array.from(document.querySelectorAll(".touch-btn"));

let activeGame = "snake";
const heldKeys = new Set();

function setActiveGame(gameId) {
  activeGame = gameId;
  selectorButtons.forEach((button) => button.classList.toggle("active", button.dataset.game === gameId));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === gameId));
}

selectorButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveGame(button.dataset.game));
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawCenteredText(ctx, lines) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.76)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = '24px "Courier New", monospace';
  lines.forEach((line, index) => {
    ctx.fillText(line, 42, 170 + index * 34);
  });
  ctx.restore();
}

function holdVirtualKey(key) {
  heldKeys.add(key);
}

function releaseVirtualKey(key) {
  heldKeys.delete(key);
}

function tapVirtualKey(key) {
  handleGameKey(key);
}

const touchKeyMap = {
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  a: " ",
  b: "arrowup"
};

touchButtons.forEach((button) => {
  const key = touchKeyMap[button.dataset.touch];
  const start = (event) => {
    event.preventDefault();
    button.classList.add("active");
    if (button.dataset.touch === "a" || button.dataset.touch === "b") {
      tapVirtualKey(key);
    } else {
      holdVirtualKey(key);
      handleGameKey(key);
    }
  };
  const end = (event) => {
    event.preventDefault();
    button.classList.remove("active");
    releaseVirtualKey(key);
  };
  button.addEventListener("touchstart", start, { passive: false });
  button.addEventListener("touchend", end, { passive: false });
  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", end);
  button.addEventListener("mouseleave", end);
});

const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");
const snakeScore = document.getElementById("snake-score");
const snakeBest = document.getElementById("snake-best");
const snakeStateLabel = document.getElementById("snake-state");
const snakeState = {
  size: 21,
  snake: [],
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  score: 0,
  best: 0,
  over: false,
  accumulator: 0
};

function placeSnakeFood() {
  let food;
  do {
    food = { x: randomInt(0, snakeState.size - 1), y: randomInt(0, snakeState.size - 1) };
  } while (snakeState.snake.some((segment) => segment.x === food.x && segment.y === food.y));
  snakeState.food = food;
}

function resetSnake() {
  snakeState.snake = [{ x: 10, y: 10 }];
  snakeState.dir = { x: 1, y: 0 };
  snakeState.nextDir = { x: 1, y: 0 };
  snakeState.score = 0;
  snakeState.over = false;
  snakeState.accumulator = 0;
  placeSnakeFood();
}

function updateSnake(dt) {
  if (activeGame !== "snake" || snakeState.over) {
    return;
  }
  snakeState.accumulator += dt;
  if (snakeState.accumulator < 120) {
    return;
  }
  snakeState.accumulator = 0;
  snakeState.dir = snakeState.nextDir;
  const head = { x: snakeState.snake[0].x + snakeState.dir.x, y: snakeState.snake[0].y + snakeState.dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= snakeState.size || head.y >= snakeState.size || snakeState.snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    snakeState.over = true;
    return;
  }
  snakeState.snake.unshift(head);
  if (head.x === snakeState.food.x && head.y === snakeState.food.y) {
    snakeState.score += 1;
    snakeState.best = Math.max(snakeState.best, snakeState.score);
    placeSnakeFood();
  } else {
    snakeState.snake.pop();
  }
}

function drawSnake() {
  const cell = snakeCanvas.width / snakeState.size;
  snakeCtx.fillStyle = "#050505";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeCtx.strokeStyle = "#111111";
  for (let i = 0; i <= snakeState.size; i += 1) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(i * cell, 0);
    snakeCtx.lineTo(i * cell, snakeCanvas.height);
    snakeCtx.stroke();
    snakeCtx.beginPath();
    snakeCtx.moveTo(0, i * cell);
    snakeCtx.lineTo(snakeCanvas.width, i * cell);
    snakeCtx.stroke();
  }
  snakeCtx.fillStyle = "#ffffff";
  snakeCtx.fillRect(snakeState.food.x * cell + 4, snakeState.food.y * cell + 4, cell - 8, cell - 8);
  snakeState.snake.forEach((segment, index) => {
    snakeCtx.fillStyle = index === 0 ? "#ffffff" : "#cfcfcf";
    snakeCtx.fillRect(segment.x * cell + 2, segment.y * cell + 2, cell - 4, cell - 4);
  });
  snakeScore.textContent = String(snakeState.score);
  snakeBest.textContent = String(snakeState.best);
  snakeStateLabel.textContent = snakeState.over ? "down" : "live";
  if (snakeState.over) {
    drawCenteredText(snakeCtx, ["game over", "restart snake"]);
  }
}

document.getElementById("snake-reset").addEventListener("click", resetSnake);

const dodgerCanvas = document.getElementById("dodger-canvas");
const dodgerCtx = dodgerCanvas.getContext("2d");
const dodgerScore = document.getElementById("dodger-score");
const dodgerLives = document.getElementById("dodger-lives");
const dodgerStateLabel = document.getElementById("dodger-state");
const dodgerState = {
  playerX: 190,
  score: 0,
  lives: 3,
  entities: [],
  spawnTimer: 0,
  over: false
};

function resetDodger() {
  dodgerState.playerX = 190;
  dodgerState.score = 0;
  dodgerState.lives = 3;
  dodgerState.entities = [];
  dodgerState.spawnTimer = 0;
  dodgerState.over = false;
}

function updateDodger(dt) {
  if (activeGame !== "dodger" || dodgerState.over) {
    return;
  }
  if (heldKeys.has("arrowleft") || heldKeys.has("a")) {
    dodgerState.playerX = Math.max(0, dodgerState.playerX - 7);
  }
  if (heldKeys.has("arrowright") || heldKeys.has("d")) {
    dodgerState.playerX = Math.min(dodgerCanvas.width - 40, dodgerState.playerX + 7);
  }
  dodgerState.spawnTimer += dt;
  if (dodgerState.spawnTimer >= 650) {
    dodgerState.spawnTimer = 0;
    const bug = Math.random() < 0.72;
    dodgerState.entities.push({ x: Math.floor(Math.random() * 9) * 42 + 12, y: -24, size: 24, speed: bug ? randomInt(4, 6) : randomInt(3, 4), type: bug ? "bug" : "commit" });
  }
  dodgerState.entities = dodgerState.entities.filter((entity) => {
    entity.y += entity.speed;
    const hit = entity.x < dodgerState.playerX + 40 && entity.x + entity.size > dodgerState.playerX && entity.y < 400 && entity.y + entity.size > 376;
    if (hit) {
      if (entity.type === "bug") {
        dodgerState.lives -= 1;
        dodgerState.over = dodgerState.lives <= 0;
      } else {
        dodgerState.score += 5;
      }
      return false;
    }
    if (entity.y > dodgerCanvas.height) {
      if (entity.type === "bug") {
        dodgerState.score += 1;
      }
      return false;
    }
    return true;
  });
}

function drawDodger() {
  dodgerCtx.fillStyle = "#030303";
  dodgerCtx.fillRect(0, 0, dodgerCanvas.width, dodgerCanvas.height);
  dodgerCtx.strokeStyle = "#111111";
  for (let i = 0; i <= 10; i += 1) {
    dodgerCtx.beginPath();
    dodgerCtx.moveTo(i * 42, 0);
    dodgerCtx.lineTo(i * 42, dodgerCanvas.height);
    dodgerCtx.stroke();
  }
  dodgerCtx.fillStyle = "#ffffff";
  dodgerCtx.fillRect(dodgerState.playerX, 376, 40, 24);
  dodgerState.entities.forEach((entity) => {
    dodgerCtx.fillStyle = entity.type === "bug" ? "#7d7d7d" : "#ffffff";
    dodgerCtx.fillRect(entity.x, entity.y, entity.size, entity.size);
    if (entity.type === "bug") {
      dodgerCtx.clearRect(entity.x + 7, entity.y + 7, 10, 10);
    }
  });
  dodgerScore.textContent = String(dodgerState.score);
  dodgerLives.textContent = String(dodgerState.lives);
  dodgerStateLabel.textContent = dodgerState.over ? "down" : "live";
  if (dodgerState.over) {
    drawCenteredText(dodgerCtx, ["run failed", "restart dodger"]);
  }
}

document.getElementById("dodger-reset").addEventListener("click", resetDodger);

const invadersCanvas = document.getElementById("invaders-canvas");
const invadersCtx = invadersCanvas.getContext("2d");
const invadersScore = document.getElementById("invaders-score");
const invadersLives = document.getElementById("invaders-lives");
const invadersWave = document.getElementById("invaders-wave");
const invadersState = { playerX: 190, bullets: [], enemyBullets: [], aliens: [], direction: 1, moveTimer: 0, shootCooldown: 0, score: 0, lives: 3, wave: 1, over: false };

function spawnInvadersWave() {
  invadersState.aliens = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      invadersState.aliens.push({ x: 36 + col * 42, y: 40 + row * 32 });
    }
  }
  invadersState.direction = 1;
}

function resetInvaders() {
  invadersState.playerX = 190;
  invadersState.bullets = [];
  invadersState.enemyBullets = [];
  invadersState.moveTimer = 0;
  invadersState.shootCooldown = 0;
  invadersState.score = 0;
  invadersState.lives = 3;
  invadersState.wave = 1;
  invadersState.over = false;
  spawnInvadersWave();
}

function updateInvaders(dt) {
  if (activeGame !== "invaders" || invadersState.over) {
    return;
  }
  if (heldKeys.has("arrowleft") || heldKeys.has("a")) {
    invadersState.playerX = Math.max(12, invadersState.playerX - 5);
  }
  if (heldKeys.has("arrowright") || heldKeys.has("d")) {
    invadersState.playerX = Math.min(invadersCanvas.width - 52, invadersState.playerX + 5);
  }
  invadersState.moveTimer += dt;
  invadersState.shootCooldown = Math.max(0, invadersState.shootCooldown - dt);
  if (invadersState.moveTimer >= Math.max(180, 520 - invadersState.wave * 30)) {
    invadersState.moveTimer = 0;
    let edgeHit = false;
    invadersState.aliens.forEach((alien) => {
      alien.x += 10 * invadersState.direction;
      if (alien.x < 18 || alien.x > invadersCanvas.width - 38) {
        edgeHit = true;
      }
    });
    if (edgeHit) {
      invadersState.direction *= -1;
      invadersState.aliens.forEach((alien) => { alien.y += 18; });
    }
  }
  if (Math.random() < 0.02 && invadersState.aliens.length) {
    const shooter = invadersState.aliens[randomInt(0, invadersState.aliens.length - 1)];
    invadersState.enemyBullets.push({ x: shooter.x + 10, y: shooter.y + 14 });
  }
  invadersState.bullets.forEach((bullet) => { bullet.y -= 8; });
  invadersState.enemyBullets.forEach((bullet) => { bullet.y += 5; });
  invadersState.bullets = invadersState.bullets.filter((bullet) => bullet.y > -20);
  invadersState.enemyBullets = invadersState.enemyBullets.filter((bullet) => bullet.y < invadersCanvas.height + 20);
  invadersState.bullets = invadersState.bullets.filter((bullet) => {
    const hitAlien = invadersState.aliens.find((alien) => bullet.x > alien.x && bullet.x < alien.x + 20 && bullet.y > alien.y && bullet.y < alien.y + 18);
    if (hitAlien) {
      invadersState.aliens = invadersState.aliens.filter((alien) => alien !== hitAlien);
      invadersState.score += 10;
      return false;
    }
    return true;
  });
  invadersState.enemyBullets = invadersState.enemyBullets.filter((bullet) => {
    const hitPlayer = bullet.x > invadersState.playerX && bullet.x < invadersState.playerX + 40 && bullet.y > 370 && bullet.y < 402;
    if (hitPlayer) {
      invadersState.lives -= 1;
      invadersState.over = invadersState.lives <= 0;
      return false;
    }
    return true;
  });
  if (invadersState.aliens.some((alien) => alien.y > 330)) {
    invadersState.over = true;
  }
  if (!invadersState.aliens.length && !invadersState.over) {
    invadersState.wave += 1;
    spawnInvadersWave();
  }
}

function drawInvaders() {
  invadersCtx.fillStyle = "#030303";
  invadersCtx.fillRect(0, 0, invadersCanvas.width, invadersCanvas.height);
  invadersCtx.strokeStyle = "#0f0f0f";
  for (let i = 0; i < 14; i += 1) {
    invadersCtx.beginPath();
    invadersCtx.moveTo(0, i * 30);
    invadersCtx.lineTo(invadersCanvas.width, i * 30);
    invadersCtx.stroke();
  }
  invadersCtx.fillStyle = "#ffffff";
  invadersCtx.fillRect(invadersState.playerX, 380, 40, 18);
  invadersState.aliens.forEach((alien) => {
    invadersCtx.fillStyle = "#dcdcdc";
    invadersCtx.fillRect(alien.x, alien.y, 20, 16);
    invadersCtx.clearRect(alien.x + 5, alien.y + 5, 3, 3);
    invadersCtx.clearRect(alien.x + 12, alien.y + 5, 3, 3);
  });
  invadersCtx.fillStyle = "#ffffff";
  invadersState.bullets.forEach((bullet) => invadersCtx.fillRect(bullet.x, bullet.y, 3, 10));
  invadersCtx.fillStyle = "#888888";
  invadersState.enemyBullets.forEach((bullet) => invadersCtx.fillRect(bullet.x, bullet.y, 3, 10));
  invadersScore.textContent = String(invadersState.score);
  invadersLives.textContent = String(invadersState.lives);
  invadersWave.textContent = String(invadersState.wave);
  if (invadersState.over) {
    drawCenteredText(invadersCtx, ["fleet lost", "restart invaders"]);
  }
}

document.getElementById("invaders-reset").addEventListener("click", resetInvaders);

const mazeCanvas = document.getElementById("maze-canvas");
const mazeCtx = mazeCanvas.getContext("2d");
const mazeScore = document.getElementById("maze-score");
const mazeDots = document.getElementById("maze-dots");
const mazeLives = document.getElementById("maze-lives");
const mazeTemplate = ["###############", "#.............#", "#.###.###.###.#", "#.............#", "#.###.#.#.###.#", "#.....#.#.....#", "#####.#.#.#####", "#.............#", "#.###.###.###.#", "#...#.....#...#", "###.#.###.#.###", "#.....#.#.....#", "#.#####.#####.#", "#.............#", "###############"];
const mazeState = { grid: [], player: { x: 1, y: 1 }, direction: { x: 1, y: 0 }, pendingDirection: { x: 1, y: 0 }, enemies: [], score: 0, lives: 3, moveTimer: 0, enemyTimer: 0, over: false, win: false };

function cloneMaze() {
  return mazeTemplate.map((row) => row.split(""));
}

function resetMaze() {
  mazeState.grid = cloneMaze();
  mazeState.player = { x: 1, y: 1 };
  mazeState.direction = { x: 1, y: 0 };
  mazeState.pendingDirection = { x: 1, y: 0 };
  mazeState.enemies = [{ x: 13, y: 1, dir: { x: -1, y: 0 } }, { x: 13, y: 13, dir: { x: 0, y: -1 } }, { x: 1, y: 13, dir: { x: 1, y: 0 } }];
  mazeState.score = 0;
  mazeState.lives = 3;
  mazeState.moveTimer = 0;
  mazeState.enemyTimer = 0;
  mazeState.over = false;
  mazeState.win = false;
}

function canMoveMaze(x, y) {
  return mazeState.grid[y] && mazeState.grid[y][x] !== "#";
}

function remainingDots() {
  return mazeState.grid.reduce((count, row) => count + row.filter((cell) => cell === ".").length, 0);
}

function loseMazeLife() {
  mazeState.lives -= 1;
  if (mazeState.lives <= 0) {
    mazeState.over = true;
    return;
  }
  mazeState.player = { x: 1, y: 1 };
}

function updateMaze(dt) {
  if (activeGame !== "maze" || mazeState.over || mazeState.win) {
    return;
  }
  mazeState.moveTimer += dt;
  mazeState.enemyTimer += dt;
  if (mazeState.moveTimer >= 130) {
    mazeState.moveTimer = 0;
    const tryX = mazeState.player.x + mazeState.pendingDirection.x;
    const tryY = mazeState.player.y + mazeState.pendingDirection.y;
    if (canMoveMaze(tryX, tryY)) {
      mazeState.direction = { ...mazeState.pendingDirection };
    }
    const nextX = mazeState.player.x + mazeState.direction.x;
    const nextY = mazeState.player.y + mazeState.direction.y;
    if (canMoveMaze(nextX, nextY)) {
      mazeState.player.x = nextX;
      mazeState.player.y = nextY;
      if (mazeState.grid[nextY][nextX] === ".") {
        mazeState.grid[nextY][nextX] = " ";
        mazeState.score += 10;
      }
    }
  }
  if (mazeState.enemyTimer >= 220) {
    mazeState.enemyTimer = 0;
    mazeState.enemies.forEach((enemy) => {
      const options = [enemy.dir, { x: -enemy.dir.y, y: enemy.dir.x }, { x: enemy.dir.y, y: -enemy.dir.x }, { x: -enemy.dir.x, y: -enemy.dir.y }].filter((dir) => canMoveMaze(enemy.x + dir.x, enemy.y + dir.y));
      enemy.dir = options[randomInt(0, options.length - 1)] || enemy.dir;
      enemy.x += enemy.dir.x;
      enemy.y += enemy.dir.y;
    });
  }
  if (mazeState.enemies.some((enemy) => enemy.x === mazeState.player.x && enemy.y === mazeState.player.y)) {
    loseMazeLife();
  }
  if (remainingDots() === 0) {
    mazeState.win = true;
  }
}

function drawMaze() {
  const size = mazeCanvas.width / mazeTemplate[0].length;
  mazeCtx.fillStyle = "#030303";
  mazeCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  mazeState.grid.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === "#") {
      mazeCtx.fillStyle = "#1b1b1b";
      mazeCtx.fillRect(x * size, y * size, size, size);
    } else if (cell === ".") {
      mazeCtx.fillStyle = "#ffffff";
      mazeCtx.beginPath();
      mazeCtx.arc(x * size + size / 2, y * size + size / 2, 3, 0, Math.PI * 2);
      mazeCtx.fill();
    }
  }));
  mazeCtx.fillStyle = "#ffffff";
  mazeCtx.beginPath();
  mazeCtx.arc(mazeState.player.x * size + size / 2, mazeState.player.y * size + size / 2, size * 0.36, 0.2, Math.PI * 1.8);
  mazeCtx.lineTo(mazeState.player.x * size + size / 2, mazeState.player.y * size + size / 2);
  mazeCtx.fill();
  mazeState.enemies.forEach((enemy, index) => {
    mazeCtx.fillStyle = index === 0 ? "#aaaaaa" : index === 1 ? "#dcdcdc" : "#7d7d7d";
    mazeCtx.fillRect(enemy.x * size + 4, enemy.y * size + 4, size - 8, size - 8);
  });
  mazeScore.textContent = String(mazeState.score);
  mazeDots.textContent = String(remainingDots());
  mazeLives.textContent = String(mazeState.lives);
  if (mazeState.over) {
    drawCenteredText(mazeCtx, ["caught", "restart maze"]);
  } else if (mazeState.win) {
    drawCenteredText(mazeCtx, ["maze clear", "perfect run"]);
  }
}

document.getElementById("maze-reset").addEventListener("click", resetMaze);

const racerCanvas = document.getElementById("racer-canvas");
const racerCtx = racerCanvas.getContext("2d");
const racerDistance = document.getElementById("racer-distance");
const racerSpeed = document.getElementById("racer-speed");
const racerLives = document.getElementById("racer-lives");
const racerState = { lane: 1, offset: 0, distance: 0, speed: 4, lives: 3, cars: [], spawnTimer: 0, over: false };

function resetRacer() {
  racerState.lane = 1;
  racerState.offset = 0;
  racerState.distance = 0;
  racerState.speed = 4;
  racerState.lives = 3;
  racerState.cars = [];
  racerState.spawnTimer = 0;
  racerState.over = false;
}

function updateRacer(dt) {
  if (activeGame !== "racer" || racerState.over) {
    return;
  }
  const boosting = heldKeys.has("arrowup") || heldKeys.has("w") || heldKeys.has(" ");
  racerState.speed = clamp(racerState.speed + (boosting ? 0.06 : -0.03), 3.5, 8.5);
  racerState.distance += racerState.speed * dt * 0.02;
  racerState.offset += racerState.speed * 0.03;
  racerState.spawnTimer += dt;
  if (racerState.spawnTimer >= 900) {
    racerState.spawnTimer = 0;
    racerState.cars.push({ lane: randomInt(0, 2), y: -80, speed: racerState.speed + randomInt(2, 4) });
  }
  racerState.cars = racerState.cars.filter((car) => {
    car.y += car.speed;
    const playerX = 130 + racerState.lane * 70;
    const carX = 130 + car.lane * 70;
    const hit = playerX < carX + 50 && playerX + 50 > carX && 312 < car.y + 80 && 392 > car.y;
    if (hit) {
      racerState.lives -= 1;
      racerState.over = racerState.lives <= 0;
      return false;
    }
    return car.y < racerCanvas.height + 100;
  });
}

function drawRacer() {
  racerCtx.fillStyle = "#020202";
  racerCtx.fillRect(0, 0, racerCanvas.width, racerCanvas.height);
  racerCtx.fillStyle = "#0e0e0e";
  racerCtx.beginPath();
  racerCtx.moveTo(70, 0);
  racerCtx.lineTo(350, 0);
  racerCtx.lineTo(420, 420);
  racerCtx.lineTo(0, 420);
  racerCtx.closePath();
  racerCtx.fill();
  racerCtx.strokeStyle = "#ffffff";
  racerCtx.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    const y = (i * 34 + racerState.offset * 40) % 480 - 40;
    racerCtx.beginPath();
    racerCtx.moveTo(210, y);
    racerCtx.lineTo(210, y + 20);
    racerCtx.stroke();
  }
  racerCtx.fillStyle = "#ffffff";
  racerCtx.fillRect(130 + racerState.lane * 70, 312, 50, 80);
  racerState.cars.forEach((car) => {
    racerCtx.fillStyle = "#9d9d9d";
    racerCtx.fillRect(130 + car.lane * 70, car.y, 50, 80);
  });
  racerDistance.textContent = String(Math.floor(racerState.distance));
  racerSpeed.textContent = String(racerState.speed.toFixed(1));
  racerLives.textContent = String(racerState.lives);
  if (racerState.over) {
    drawCenteredText(racerCtx, ["race over", "restart kart"]);
  }
}

document.getElementById("racer-reset").addEventListener("click", resetRacer);

const tetrisCanvas = document.getElementById("tetris-canvas");
const tetrisCtx = tetrisCanvas.getContext("2d");
const tetrisScore = document.getElementById("tetris-score");
const tetrisLines = document.getElementById("tetris-lines");
const tetrisLevel = document.getElementById("tetris-level");
const tetrominoes = { I: [[1, 1, 1, 1]], O: [[1, 1], [1, 1]], T: [[0, 1, 0], [1, 1, 1]], L: [[1, 0], [1, 0], [1, 1]], J: [[0, 1], [0, 1], [1, 1]], S: [[0, 1, 1], [1, 1, 0]], Z: [[1, 1, 0], [0, 1, 1]] };
const tetrisState = { board: [], piece: null, score: 0, lines: 0, level: 1, accumulator: 0, over: false };

function emptyBoard() {
  return Array.from({ length: 20 }, () => Array(10).fill(0));
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function randomPiece() {
  const keys = Object.keys(tetrominoes);
  const key = keys[randomInt(0, keys.length - 1)];
  return { shape: tetrominoes[key].map((row) => [...row]), x: 3, y: 0 };
}

function collides(board, piece) {
  return piece.shape.some((row, y) => row.some((value, x) => {
    if (!value) {
      return false;
    }
    const boardX = piece.x + x;
    const boardY = piece.y + y;
    return boardX < 0 || boardX >= 10 || boardY >= 20 || (boardY >= 0 && board[boardY][boardX]);
  }));
}

function mergePiece() {
  tetrisState.piece.shape.forEach((row, y) => row.forEach((value, x) => {
    if (value && tetrisState.board[tetrisState.piece.y + y]) {
      tetrisState.board[tetrisState.piece.y + y][tetrisState.piece.x + x] = value;
    }
  }));
}

function clearLines() {
  let cleared = 0;
  tetrisState.board = tetrisState.board.filter((row) => {
    if (row.every(Boolean)) {
      cleared += 1;
      return false;
    }
    return true;
  });
  while (tetrisState.board.length < 20) {
    tetrisState.board.unshift(Array(10).fill(0));
  }
  if (cleared) {
    tetrisState.lines += cleared;
    tetrisState.score += [0, 100, 300, 500, 800][cleared] * tetrisState.level;
    tetrisState.level = 1 + Math.floor(tetrisState.lines / 10);
  }
}

function spawnPiece() {
  tetrisState.piece = randomPiece();
  if (collides(tetrisState.board, tetrisState.piece)) {
    tetrisState.over = true;
  }
}

function resetTetris() {
  tetrisState.board = emptyBoard();
  tetrisState.score = 0;
  tetrisState.lines = 0;
  tetrisState.level = 1;
  tetrisState.accumulator = 0;
  tetrisState.over = false;
  spawnPiece();
}

function stepTetrisDown() {
  if (tetrisState.over) {
    return;
  }
  tetrisState.piece.y += 1;
  if (collides(tetrisState.board, tetrisState.piece)) {
    tetrisState.piece.y -= 1;
    mergePiece();
    clearLines();
    spawnPiece();
  }
}

function updateTetris(dt) {
  if (activeGame !== "tetris" || tetrisState.over) {
    return;
  }
  tetrisState.accumulator += dt;
  const speed = Math.max(100, 700 - (tetrisState.level - 1) * 50);
  if (tetrisState.accumulator >= speed) {
    tetrisState.accumulator = 0;
    stepTetrisDown();
  }
}

function drawTetris() {
  const cell = tetrisCanvas.width / 10;
  tetrisCtx.fillStyle = "#050505";
  tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  tetrisCtx.strokeStyle = "#111111";
  for (let x = 0; x <= 10; x += 1) {
    tetrisCtx.beginPath();
    tetrisCtx.moveTo(x * cell, 0);
    tetrisCtx.lineTo(x * cell, tetrisCanvas.height);
    tetrisCtx.stroke();
  }
  for (let y = 0; y <= 20; y += 1) {
    tetrisCtx.beginPath();
    tetrisCtx.moveTo(0, y * cell);
    tetrisCtx.lineTo(tetrisCanvas.width, y * cell);
    tetrisCtx.stroke();
  }
  tetrisState.board.forEach((row, y) => row.forEach((value, x) => {
    if (value) {
      tetrisCtx.fillStyle = "#ffffff";
      tetrisCtx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
    }
  }));
  if (tetrisState.piece) {
    tetrisState.piece.shape.forEach((row, y) => row.forEach((value, x) => {
      if (value) {
        tetrisCtx.fillStyle = "#cfcfcf";
        tetrisCtx.fillRect((tetrisState.piece.x + x) * cell + 1, (tetrisState.piece.y + y) * cell + 1, cell - 2, cell - 2);
      }
    }));
  }
  tetrisScore.textContent = String(tetrisState.score);
  tetrisLines.textContent = String(tetrisState.lines);
  tetrisLevel.textContent = String(tetrisState.level);
  if (tetrisState.over) {
    drawCenteredText(tetrisCtx, ["stack overflow", "restart tetris"]);
  }
}

document.getElementById("tetris-reset").addEventListener("click", resetTetris);

const infinityCanvas = document.getElementById("infinity-canvas");
const infinityCtx = infinityCanvas.getContext("2d");
const infinityScore = document.getElementById("infinity-score");
const infinityMax = document.getElementById("infinity-max");
const infinityStateLabel = document.getElementById("infinity-state");
const infinityMessage = document.getElementById("infinity-message");
const infinityState = { board: [], score: 0, over: false };

function emptyInfinityBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addInfinityTile() {
  const empty = [];
  infinityState.board.forEach((row, y) => row.forEach((value, x) => {
    if (value === 0) {
      empty.push({ x, y });
    }
  }));
  if (!empty.length) {
    return;
  }
  const choice = empty[randomInt(0, empty.length - 1)];
  infinityState.board[choice.y][choice.x] = Math.random() < 0.9 ? 2 : 4;
}

function resetInfinity() {
  infinityState.board = emptyInfinityBoard();
  infinityState.score = 0;
  infinityState.over = false;
  addInfinityTile();
  addInfinityTile();
  infinityMessage.textContent = "controls: arrow keys / WASD";
}

function compressLine(line) {
  const filtered = line.filter(Boolean);
  const output = [];
  let score = 0;
  for (let i = 0; i < filtered.length; i += 1) {
    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      output.push(merged);
      score += merged;
      i += 1;
    } else {
      output.push(filtered[i]);
    }
  }
  while (output.length < 4) {
    output.push(0);
  }
  return { line: output, score };
}

function boardsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function projectMove(board, direction) {
  const next = board.map((row) => [...row]);
  if (direction === "left" || direction === "right") {
    next.forEach((row, rowIndex) => {
      const line = direction === "right" ? [...row].reverse() : [...row];
      const compressed = compressLine(line).line;
      next[rowIndex] = direction === "right" ? compressed.reverse() : compressed;
    });
  } else {
    for (let x = 0; x < 4; x += 1) {
      const column = next.map((row) => row[x]);
      const line = direction === "down" ? column.reverse() : column;
      const compressed = compressLine(line).line;
      const result = direction === "down" ? compressed.reverse() : compressed;
      for (let y = 0; y < 4; y += 1) {
        next[y][x] = result[y];
      }
    }
  }
  return next;
}

function moveInfinity(direction) {
  if (infinityState.over) {
    return;
  }
  const original = infinityState.board.map((row) => [...row]);
  let total = 0;
  if (direction === "left" || direction === "right") {
    infinityState.board = infinityState.board.map((row) => {
      const line = direction === "right" ? [...row].reverse() : [...row];
      const compressed = compressLine(line);
      total += compressed.score;
      return direction === "right" ? compressed.line.reverse() : compressed.line;
    });
  } else {
    for (let x = 0; x < 4; x += 1) {
      const column = infinityState.board.map((row) => row[x]);
      const line = direction === "down" ? column.reverse() : column;
      const compressed = compressLine(line);
      total += compressed.score;
      const result = direction === "down" ? compressed.line.reverse() : compressed.line;
      for (let y = 0; y < 4; y += 1) {
        infinityState.board[y][x] = result[y];
      }
    }
  }
  if (!boardsEqual(original, infinityState.board)) {
    infinityState.score += total;
    addInfinityTile();
  }
  infinityState.over = !["left", "right", "up", "down"].some((dir) => !boardsEqual(projectMove(infinityState.board, dir), infinityState.board));
}

function drawInfinity() {
  infinityCtx.fillStyle = "#050505";
  infinityCtx.fillRect(0, 0, infinityCanvas.width, infinityCanvas.height);
  const size = 92;
  infinityState.board.forEach((row, y) => row.forEach((value, x) => {
    const px = 18 + x * 98;
    const py = 18 + y * 98;
    infinityCtx.fillStyle = value ? "#ffffff" : "#111111";
    infinityCtx.fillRect(px, py, size, size);
    if (value) {
      infinityCtx.fillStyle = "#000000";
      infinityCtx.font = value >= 1024 ? '26px "Courier New", monospace' : '32px "Courier New", monospace';
      infinityCtx.fillText(String(value), px + 16, py + 54);
    }
  }));
  const maxTile = Math.max(...infinityState.board.flat());
  infinityScore.textContent = String(infinityState.score);
  infinityMax.textContent = String(maxTile || 2);
  infinityStateLabel.textContent = infinityState.over ? "locked" : "live";
  if (infinityState.over) {
    infinityMessage.textContent = "No moves left. Restart the run.";
  }
}

document.getElementById("infinity-reset").addEventListener("click", resetInfinity);

const breakoutCanvas = document.getElementById("breakout-canvas");
const breakoutCtx = breakoutCanvas.getContext("2d");
const breakoutScore = document.getElementById("breakout-score");
const breakoutLives = document.getElementById("breakout-lives");
const breakoutBricks = document.getElementById("breakout-bricks");
const breakoutState = { paddleX: 160, ball: { x: 210, y: 260, dx: 3.2, dy: -3.2 }, bricks: [], score: 0, lives: 3, over: false, win: false };

function spawnBricks() {
  breakoutState.bricks = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      breakoutState.bricks.push({ x: 14 + col * 49, y: 24 + row * 24, alive: true });
    }
  }
}

function resetBreakout() {
  breakoutState.paddleX = 160;
  breakoutState.ball = { x: 210, y: 260, dx: 3.2, dy: -3.2 };
  breakoutState.score = 0;
  breakoutState.lives = 3;
  breakoutState.over = false;
  breakoutState.win = false;
  spawnBricks();
}

function updateBreakout() {
  if (activeGame !== "breakout" || breakoutState.over || breakoutState.win) {
    return;
  }
  if (heldKeys.has("arrowleft") || heldKeys.has("a")) {
    breakoutState.paddleX = Math.max(0, breakoutState.paddleX - 7);
  }
  if (heldKeys.has("arrowright") || heldKeys.has("d")) {
    breakoutState.paddleX = Math.min(breakoutCanvas.width - 90, breakoutState.paddleX + 7);
  }
  breakoutState.ball.x += breakoutState.ball.dx;
  breakoutState.ball.y += breakoutState.ball.dy;
  if (breakoutState.ball.x <= 8 || breakoutState.ball.x >= breakoutCanvas.width - 8) {
    breakoutState.ball.dx *= -1;
  }
  if (breakoutState.ball.y <= 8) {
    breakoutState.ball.dy *= -1;
  }
  if (breakoutState.ball.y >= 372 && breakoutState.ball.x >= breakoutState.paddleX && breakoutState.ball.x <= breakoutState.paddleX + 90) {
    breakoutState.ball.dy = -Math.abs(breakoutState.ball.dy);
    const offset = (breakoutState.ball.x - (breakoutState.paddleX + 45)) / 45;
    breakoutState.ball.dx = offset * 4.5;
  }
  breakoutState.bricks.forEach((brick) => {
    if (brick.alive && breakoutState.ball.x >= brick.x && breakoutState.ball.x <= brick.x + 40 && breakoutState.ball.y >= brick.y && breakoutState.ball.y <= brick.y + 16) {
      brick.alive = false;
      breakoutState.score += 10;
      breakoutState.ball.dy *= -1;
    }
  });
  if (breakoutState.ball.y > breakoutCanvas.height + 10) {
    breakoutState.lives -= 1;
    if (breakoutState.lives <= 0) {
      breakoutState.over = true;
    } else {
      breakoutState.ball = { x: 210, y: 260, dx: 3.2, dy: -3.2 };
      breakoutState.paddleX = 160;
    }
  }
  breakoutState.win = breakoutState.bricks.every((brick) => !brick.alive);
}

function drawBreakout() {
  breakoutCtx.fillStyle = "#030303";
  breakoutCtx.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);
  breakoutState.bricks.forEach((brick) => {
    if (brick.alive) {
      breakoutCtx.fillStyle = "#dcdcdc";
      breakoutCtx.fillRect(brick.x, brick.y, 40, 16);
    }
  });
  breakoutCtx.fillStyle = "#ffffff";
  breakoutCtx.fillRect(breakoutState.paddleX, 384, 90, 12);
  breakoutCtx.beginPath();
  breakoutCtx.arc(breakoutState.ball.x, breakoutState.ball.y, 7, 0, Math.PI * 2);
  breakoutCtx.fill();
  breakoutScore.textContent = String(breakoutState.score);
  breakoutLives.textContent = String(breakoutState.lives);
  breakoutBricks.textContent = String(breakoutState.bricks.filter((brick) => brick.alive).length);
  if (breakoutState.over) {
    drawCenteredText(breakoutCtx, ["ball lost", "restart breakout"]);
  } else if (breakoutState.win) {
    drawCenteredText(breakoutCtx, ["wall cleared", "clean sweep"]);
  }
}

document.getElementById("breakout-reset").addEventListener("click", resetBreakout);

function handleGameKey(eventKey) {
  const key = eventKey.toLowerCase();

  if (activeGame === "snake") {
    const next = {
      arrowup: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
      d: { x: 1, y: 0 }
    }[key];
    if (next && !(next.x === -snakeState.dir.x && next.y === -snakeState.dir.y)) {
      snakeState.nextDir = next;
    }
  }

  if (activeGame === "invaders" && key === " " && invadersState.shootCooldown <= 0 && !invadersState.over) {
    invadersState.bullets.push({ x: invadersState.playerX + 19, y: 368 });
    invadersState.shootCooldown = 250;
  }

  if (activeGame === "maze") {
    const direction = {
      arrowup: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
      d: { x: 1, y: 0 }
    }[key];
    if (direction) {
      mazeState.pendingDirection = direction;
    }
  }

  if (activeGame === "racer") {
    if ((key === "arrowleft" || key === "a") && racerState.lane > 0) {
      racerState.lane -= 1;
    }
    if ((key === "arrowright" || key === "d") && racerState.lane < 2) {
      racerState.lane += 1;
    }
  }

  if (activeGame === "tetris" && !tetrisState.over) {
    if (key === "arrowleft" || key === "a") {
      tetrisState.piece.x -= 1;
      if (collides(tetrisState.board, tetrisState.piece)) {
        tetrisState.piece.x += 1;
      }
    }
    if (key === "arrowright" || key === "d") {
      tetrisState.piece.x += 1;
      if (collides(tetrisState.board, tetrisState.piece)) {
        tetrisState.piece.x -= 1;
      }
    }
    if (key === "arrowup" || key === "w" || key === "b") {
      const rotated = rotateMatrix(tetrisState.piece.shape);
      const current = tetrisState.piece.shape;
      tetrisState.piece.shape = rotated;
      if (collides(tetrisState.board, tetrisState.piece)) {
        tetrisState.piece.shape = current;
      }
    }
    if (key === "arrowdown" || key === "s") {
      stepTetrisDown();
    }
    if (key === " ") {
      while (!collides(tetrisState.board, { ...tetrisState.piece, y: tetrisState.piece.y + 1 })) {
        tetrisState.piece.y += 1;
      }
      stepTetrisDown();
    }
  }

  if (activeGame === "infinity") {
    const direction = {
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down"
    }[key];
    if (direction) {
      moveInfinity(direction);
    }
  }
}

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }
  heldKeys.add(event.key.toLowerCase());
  handleGameKey(event.key);
});

document.addEventListener("keyup", (event) => {
  heldKeys.delete(event.key.toLowerCase());
});

let lastFrame = performance.now();

function frame(now) {
  const dt = now - lastFrame;
  lastFrame = now;
  updateSnake(dt);
  updateDodger(dt);
  updateInvaders(dt);
  updateMaze(dt);
  updateRacer(dt);
  updateTetris(dt);
  updateBreakout();
  drawSnake();
  drawDodger();
  drawInvaders();
  drawMaze();
  drawRacer();
  drawTetris();
  drawInfinity();
  drawBreakout();
  requestAnimationFrame(frame);
}

resetSnake();
resetDodger();
resetInvaders();
resetMaze();
resetRacer();
resetTetris();
resetInfinity();
resetBreakout();
setActiveGame("snake");
requestAnimationFrame(frame);
