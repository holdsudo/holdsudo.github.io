const selectorButtons = Array.from(document.querySelectorAll(".selector-btn"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));

selectorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const gameId = button.dataset.game;
    selectorButtons.forEach((item) => item.classList.toggle("active", item === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === gameId));
  });
});

const breachStages = [
  {
    prompt: "root@holdsudo:~# unknown process saturating memory",
    choices: [
      { label: "kill -9 4242", correct: true, result: "process terminated. memory recovered." },
      { label: "rm -rf /", correct: false, result: "catastrophic. that was not the move." },
      { label: "echo hello", correct: false, result: "friendly, but useless." }
    ]
  },
  {
    prompt: "root@holdsudo:~# deployment key missing",
    choices: [
      { label: "cat secrets.txt", correct: false, result: "file not found. also suspicious." },
      { label: "ssh-add ~/.ssh/id_ed25519", correct: true, result: "key loaded. deploy lane restored." },
      { label: "format c:", correct: false, result: "absolutely not." }
    ]
  },
  {
    prompt: "root@holdsudo:~# repo drifting from origin",
    choices: [
      { label: "git pull --rebase", correct: true, result: "history aligned. conflict avoided." },
      { label: "git blame README.md", correct: false, result: "satisfying, but not relevant." },
      { label: "shutdown /s", correct: false, result: "system refuses." }
    ]
  },
  {
    prompt: "root@holdsudo:~# final gate requests identity",
    choices: [
      { label: "whoami", correct: true, result: "holdsudo. access granted." },
      { label: "sudo sudo sudo", correct: false, result: "confidence is not a credential." },
      { label: "cls", correct: false, result: "clean screen, same problem." }
    ]
  }
];

const breachLog = document.getElementById("breach-log");
const breachChoices = document.getElementById("breach-choices");
const breachIntegrity = document.getElementById("breach-integrity");
const breachStage = document.getElementById("breach-stage");
const breachReset = document.getElementById("breach-reset");

const breachState = { index: 0, integrity: 3, over: false };

function renderBreachLog(lines) {
  breachLog.textContent = lines.join("\n\n");
}

function renderBreach() {
  const current = breachStages[breachState.index];
  breachIntegrity.textContent = String(breachState.integrity);
  breachStage.textContent = breachState.over ? "done" : `${breachState.index + 1} / ${breachStages.length}`;
  breachChoices.replaceChildren();

  if (breachState.over) {
    const win = breachState.integrity > 0 && breachState.index >= breachStages.length;
    renderBreachLog([
      win ? "system cleared." : "integrity collapsed.",
      win ? "all nodes stabilized. breach complete." : "session lost. reset and try again."
    ]);
    return;
  }

  renderBreachLog([
    current.prompt,
    "select one command:"
  ]);

  current.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice.label;
    button.addEventListener("click", () => {
      const lines = [current.prompt, `> ${choice.label}`, choice.result];
      if (choice.correct) {
        breachState.index += 1;
        if (breachState.index >= breachStages.length) {
          breachState.over = true;
        }
      } else {
        breachState.integrity -= 1;
        if (breachState.integrity <= 0) {
          breachState.over = true;
        }
      }
      renderBreachLog(lines);
      window.setTimeout(renderBreach, 450);
    });
    breachChoices.appendChild(button);
  });
}

breachReset.addEventListener("click", () => {
  breachState.index = 0;
  breachState.integrity = 3;
  breachState.over = false;
  renderBreach();
});

const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");
const snakeScore = document.getElementById("snake-score");
const snakeBest = document.getElementById("snake-best");
const snakeReset = document.getElementById("snake-reset");

const snakeState = {
  size: 21,
  snake: [{ x: 10, y: 10 }],
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  food: { x: 15, y: 7 },
  score: 0,
  best: 0,
  over: false
};

function placeSnakeFood() {
  let nextFood;
  do {
    nextFood = {
      x: Math.floor(Math.random() * snakeState.size),
      y: Math.floor(Math.random() * snakeState.size)
    };
  } while (snakeState.snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));
  snakeState.food = nextFood;
}

function resetSnake() {
  snakeState.snake = [{ x: 10, y: 10 }];
  snakeState.dir = { x: 1, y: 0 };
  snakeState.nextDir = { x: 1, y: 0 };
  snakeState.score = 0;
  snakeState.over = false;
  placeSnakeFood();
}

function drawSnake() {
  const cell = snakeCanvas.width / snakeState.size;
  snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
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
  snakeCtx.fillRect(snakeState.food.x * cell + 3, snakeState.food.y * cell + 3, cell - 6, cell - 6);

  snakeState.snake.forEach((segment, index) => {
    snakeCtx.fillStyle = index === 0 ? "#ffffff" : "#cfcfcf";
    snakeCtx.fillRect(segment.x * cell + 2, segment.y * cell + 2, cell - 4, cell - 4);
  });

  if (snakeState.over) {
    snakeCtx.fillStyle = "rgba(0,0,0,0.7)";
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeCtx.fillStyle = "#ffffff";
    snakeCtx.font = '24px "Courier New", monospace';
    snakeCtx.fillText("game over", 130, 190);
    snakeCtx.fillText("restart snake", 110, 230);
  }

  snakeScore.textContent = String(snakeState.score);
  snakeBest.textContent = String(snakeState.best);
}

function tickSnake() {
  if (!snakeState.over) {
    snakeState.dir = snakeState.nextDir;
    const head = {
      x: snakeState.snake[0].x + snakeState.dir.x,
      y: snakeState.snake[0].y + snakeState.dir.y
    };

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= snakeState.size ||
      head.y >= snakeState.size ||
      snakeState.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      snakeState.over = true;
    } else {
      snakeState.snake.unshift(head);
      if (head.x === snakeState.food.x && head.y === snakeState.food.y) {
        snakeState.score += 1;
        snakeState.best = Math.max(snakeState.best, snakeState.score);
        placeSnakeFood();
      } else {
        snakeState.snake.pop();
      }
    }
  }

  drawSnake();
}

snakeReset.addEventListener("click", () => {
  resetSnake();
  drawSnake();
});

const dodgerCanvas = document.getElementById("dodger-canvas");
const dodgerCtx = dodgerCanvas.getContext("2d");
const dodgerScore = document.getElementById("dodger-score");
const dodgerLives = document.getElementById("dodger-lives");
const dodgerReset = document.getElementById("dodger-reset");

const dodgerState = {
  playerX: 190,
  score: 0,
  lives: 3,
  entities: [],
  tick: 0,
  over: false
};

function resetDodger() {
  dodgerState.playerX = 190;
  dodgerState.score = 0;
  dodgerState.lives = 3;
  dodgerState.entities = [];
  dodgerState.tick = 0;
  dodgerState.over = false;
}

function spawnDodgerEntity() {
  const bug = Math.random() < 0.75;
  dodgerState.entities.push({
    x: Math.floor(Math.random() * 9) * 42 + 12,
    y: -26,
    w: 26,
    h: 26,
    type: bug ? "bug" : "commit"
  });
}

function drawDodger() {
  dodgerCtx.clearRect(0, 0, dodgerCanvas.width, dodgerCanvas.height);
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
    dodgerCtx.fillRect(entity.x, entity.y, entity.w, entity.h);
    if (entity.type === "bug") {
      dodgerCtx.clearRect(entity.x + 8, entity.y + 8, 10, 10);
    }
  });

  if (dodgerState.over) {
    dodgerCtx.fillStyle = "rgba(0,0,0,0.7)";
    dodgerCtx.fillRect(0, 0, dodgerCanvas.width, dodgerCanvas.height);
    dodgerCtx.fillStyle = "#ffffff";
    dodgerCtx.font = '24px "Courier New", monospace';
    dodgerCtx.fillText("run failed", 132, 190);
  }

  dodgerScore.textContent = String(dodgerState.score);
  dodgerLives.textContent = String(dodgerState.lives);
}

function tickDodger() {
  if (!dodgerState.over) {
    dodgerState.tick += 1;
    if (dodgerState.tick % 22 === 0) {
      spawnDodgerEntity();
    }

    dodgerState.entities.forEach((entity) => {
      entity.y += entity.type === "bug" ? 4.8 : 3.8;
    });

    dodgerState.entities = dodgerState.entities.filter((entity) => {
      const hitPlayer =
        entity.x < dodgerState.playerX + 40 &&
        entity.x + entity.w > dodgerState.playerX &&
        entity.y < 400 &&
        entity.y + entity.h > 376;

      if (hitPlayer) {
        if (entity.type === "bug") {
          dodgerState.lives -= 1;
          if (dodgerState.lives <= 0) {
            dodgerState.over = true;
          }
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

  drawDodger();
}

dodgerReset.addEventListener("click", () => {
  resetDodger();
  drawDodger();
});

const binaryPads = Array.from(document.querySelectorAll(".pad"));
const binaryRound = document.getElementById("binary-round");
const binaryStatus = document.getElementById("binary-status");
const binaryMessage = document.getElementById("binary-message");
const binaryStart = document.getElementById("binary-start");

const binaryState = {
  sequence: [],
  userIndex: 0,
  accepting: false
};

function flashPad(index) {
  const pad = binaryPads[index];
  pad.classList.add("active");
  window.setTimeout(() => pad.classList.remove("active"), 320);
}

function updateBinaryStatus(status, message) {
  binaryStatus.textContent = status;
  binaryMessage.textContent = message;
  binaryRound.textContent = String(binaryState.sequence.length);
}

function playBinarySequence() {
  binaryState.accepting = false;
  updateBinaryStatus("watch", "Memorize the incoming pattern.");
  binaryState.sequence.forEach((value, index) => {
    window.setTimeout(() => flashPad(value), 500 * (index + 1));
  });
  window.setTimeout(() => {
    binaryState.accepting = true;
    binaryState.userIndex = 0;
    updateBinaryStatus("input", "Repeat the sequence.");
  }, 500 * (binaryState.sequence.length + 1));
}

function nextBinaryRound() {
  binaryState.sequence.push(Math.floor(Math.random() * 4));
  playBinarySequence();
}

binaryPads.forEach((pad) => {
  pad.addEventListener("click", () => {
    if (!binaryState.accepting) {
      return;
    }

    const value = Number(pad.dataset.pad);
    flashPad(value);

    if (value !== binaryState.sequence[binaryState.userIndex]) {
      binaryState.accepting = false;
      updateBinaryStatus("failed", `Wrong pad. You reached round ${binaryState.sequence.length}.`);
      return;
    }

    binaryState.userIndex += 1;

    if (binaryState.userIndex >= binaryState.sequence.length) {
      binaryState.accepting = false;
      updateBinaryStatus("clear", "Sequence matched. Loading next round.");
      window.setTimeout(nextBinaryRound, 700);
    }
  });
});

binaryStart.addEventListener("click", () => {
  binaryState.sequence = [];
  binaryState.userIndex = 0;
  nextBinaryRound();
});

const codeAttempts = document.getElementById("code-attempts");
const codeStatus = document.getElementById("code-status");
const codeMessage = document.getElementById("code-message");
const codeHistory = document.getElementById("code-history");
const codeForm = document.getElementById("code-form");
const codeInput = document.getElementById("code-input");
const codeReset = document.getElementById("code-reset");

const codeState = {
  secret: "",
  attempts: 8,
  live: true
};

function newSecret() {
  let value = "";
  for (let i = 0; i < 4; i += 1) {
    value += Math.random() < 0.5 ? "0" : "1";
  }
  return value;
}

function resetCode() {
  codeState.secret = newSecret();
  codeState.attempts = 8;
  codeState.live = true;
  codeAttempts.textContent = String(codeState.attempts);
  codeStatus.textContent = "live";
  codeMessage.textContent = "Enter four bits using only 0 and 1.";
  codeHistory.replaceChildren();
  codeInput.value = "";
}

function scoreGuess(guess, secret) {
  let hits = 0;
  let glows = 0;
  const guessRemainder = [];
  const secretRemainder = [];

  for (let i = 0; i < 4; i += 1) {
    if (guess[i] === secret[i]) {
      hits += 1;
    } else {
      guessRemainder.push(guess[i]);
      secretRemainder.push(secret[i]);
    }
  }

  guessRemainder.forEach((digit) => {
    const index = secretRemainder.indexOf(digit);
    if (index >= 0) {
      glows += 1;
      secretRemainder.splice(index, 1);
    }
  });

  return { hits, glows };
}

codeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!codeState.live) {
    return;
  }

  const guess = codeInput.value.trim();
  if (!/^[01]{4}$/.test(guess)) {
    codeMessage.innerHTML = '<span class="danger">invalid guess. use exactly four bits.</span>';
    return;
  }

  codeState.attempts -= 1;
  codeAttempts.textContent = String(codeState.attempts);
  const result = scoreGuess(guess, codeState.secret);

  const entry = document.createElement("div");
  entry.className = "history-entry";
  entry.innerHTML = `<span>${guess}</span><span>hit ${result.hits} // glow ${result.glows}</span>`;
  codeHistory.prepend(entry);

  if (result.hits === 4) {
    codeState.live = false;
    codeStatus.textContent = "cracked";
    codeMessage.textContent = "Code cracked. Vault open.";
    return;
  }

  if (codeState.attempts <= 0) {
    codeState.live = false;
    codeStatus.textContent = "locked";
    codeMessage.textContent = `Out of attempts. Secret was ${codeState.secret}.`;
    return;
  }

  codeMessage.textContent = `hit ${result.hits} // glow ${result.glows}`;
  codeInput.value = "";
});

codeReset.addEventListener("click", resetCode);

const heldKeys = new Set();

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  heldKeys.add(event.key.toLowerCase());

  const snakeDirections = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const next = snakeDirections[event.key.toLowerCase()];
  if (next && !(next.x === -snakeState.dir.x && next.y === -snakeState.dir.y)) {
    snakeState.nextDir = next;
  }
});

document.addEventListener("keyup", (event) => {
  heldKeys.delete(event.key.toLowerCase());
});

function stepHeldMovement() {
  if (heldKeys.has("arrowleft") || heldKeys.has("a")) {
    dodgerState.playerX = Math.max(0, dodgerState.playerX - 7);
  }
  if (heldKeys.has("arrowright") || heldKeys.has("d")) {
    dodgerState.playerX = Math.min(dodgerCanvas.width - 40, dodgerState.playerX + 7);
  }
}

resetSnake();
drawSnake();
resetDodger();
drawDodger();
updateBinaryStatus("idle", "Press start to begin.");
resetCode();
renderBreach();

window.setInterval(tickSnake, 120);
window.setInterval(() => {
  stepHeldMovement();
  tickDodger();
}, 40);
