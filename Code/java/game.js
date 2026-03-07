import { PacMan } from "./pacman.js";
import { Ghost } from "./ghost.js";
import { GameMap } from "./map.js";
// Import required classes from other JS modules

//Maze layout, '#' = walls, '.' = pellets and 'o' = power pellets
const rawMap = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.#####.##.#####.######",
  "     #.#####.##.#####.#     ",
  "     #.##          ##.#     ",
  "     #.##..........##.#     ",
  "######.##..........##.######",
  "      .  ..........  .      ",
  "######.##..........##.######",
  "     #.##..........##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

//Pixel size of each tile
const tile = 16;
//Element of the canvas
const canvas = document.getElementById("gc");
const ctx = canvas.getContext("2d");
//Element of laser effect
const laserBeamEl = document.getElementById("laserBeam");
const cols = rawMap[0].length;
const rows = rawMap.length;
canvas.width = cols * tile;
canvas.height = rows * tile;

const map = new GameMap(rawMap, tile);

//Pac man starting position
let start = { r: 1, c: 1 };
outer: for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (rawMap[r][c] === ".") {
      start = { r, c };
      break outer;
    }
  }
}

//Creating Pac-man and ghosts
const pac = new PacMan(start.r, start.c, tile);

//Colours of ghost and there starting positions
const ghostColors = ["red", "pink", "cyan", "orange"];
const ghosts = [
  new Ghost(13, 12, tile, ghostColors[0]),
  new Ghost(13, 13, tile, ghostColors[1]),
  new Ghost(13, 14, tile, ghostColors[2]),
  new Ghost(13, 15, tile, ghostColors[3]),
];

//Pac-Man context and scoring link
pac.initContext(ctx, ghosts, addScore);

let score = 0;
const scoreEl = document.getElementById("score");

// Increase and display the score
function addScore(amount) {
  score += amount;
  scoreEl.textContent = "Score: " + score;
}

//Frightened mode is triggered when pac-man eats power pellet
function triggerFrightenedMode() {
  ghosts.forEach(g => g.frighten(6000));
}

//Will direct user to gameover page with their final score
function gameOver() {
  localStorage.setItem("lastScore", score);
  const currentUser = localStorage.getItem("loggedInUser");
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    if (score > (userData.topScore || 0)) {
      userData.topScore = score;
      localStorage.setItem(currentUser, JSON.stringify(userData));
    }
  }
  window.location.href = "over.html";
}

//Power up elements and buttons
const flashBtn = document.getElementById("activateFlash");
const flashStatus = document.getElementById("flashStatus");
const invisibleBtn = document.getElementById("activateInvisible");
const invisibleStatus = document.getElementById("invisibleStatus");
const laserBtn = document.getElementById("activatePowerUp");
const laserStatus = document.getElementById("powerUpStatus");

let powerUpUsed = false;

//Loads selected power up
window.addEventListener("load", () => {
  const selectedPower = localStorage.getItem("selectedPowerUp") || "none";
  //Hides all powerups
  document.querySelectorAll(".activatePowerUp, .powerUpStatus").forEach(el => {
    el.style.display = "none";
  });

  //Will show the selected power up
  if (selectedPower === "laser") {
    laserBtn.style.display = "block";
    laserStatus.style.display = "block";
  } else if (selectedPower === "flash") {
    flashBtn.style.display = "block";
    flashStatus.style.display = "block";
  } else if (selectedPower === "invisible") {
    invisibleBtn.style.display = "block";
    invisibleStatus.style.display = "block";
  }
});

// Flash Power-up
flashBtn.addEventListener("click", () => {
  if (powerUpUsed) return;
  powerUpUsed = true;
  flashStatus.textContent = "FLASH ACTIVE!";
  pac.activateFlash(5000, () => (flashStatus.textContent = "Flash expired."));
});

// Invisible Power-up
invisibleBtn.addEventListener("click", () => {
  if (powerUpUsed) return;
  powerUpUsed = true;
  invisibleStatus.textContent = "INVISIBLE!";
  pac.activateInvisibility(7000, () => (invisibleStatus.textContent = "Invisibility expired."));
});

// Laser Power-up
laserBtn.addEventListener("click", () => {
  if (powerUpUsed) return;
  powerUpUsed = true;
  laserStatus.textContent = "LASER ACTIVE!";
  laserBeamEl.classList.add("active");
  pac.activateLaser(5000, () => {
    laserStatus.textContent = "Laser expired.";
    laserBeamEl.classList.remove("active");
  });
});

//Controls for keyboard, WASD = up, left, down, right
document.addEventListener("keydown", (ev) => {
  const k = ev.key.toLowerCase();
  if (k === "arrowup" || k === "w") pac.setNextDirection(-1, 0);
  else if (k === "arrowdown" || k === "s") pac.setNextDirection(1, 0);
  else if (k === "arrowleft" || k === "a") pac.setNextDirection(0, -1);
  else if (k === "arrowright" || k === "d") pac.setNextDirection(0, 1);
});

//Laser collision wil be active once power activated
function laserHitDetection(pac) {
  if (!pac.laserActive) return;

  //The range of the laser
  const beamRange = 400;

  ghosts.forEach(g => {
    const dx = g.x - pac.x;
    const dy = g.y - pac.y;
    const dir = pac.dir;

    //Will check if ghost is in path of the laser
    const sameDirectionX = dir.c !== 0 && Math.sign(dx) === dir.c && Math.abs(dy) < 10 && Math.abs(dx) < beamRange;
    const sameDirectionY = dir.r !== 0 && Math.sign(dy) === dir.r && Math.abs(dx) < 10 && Math.abs(dy) < beamRange;

    //Will add score and ghost respawn in middle
    if (sameDirectionX || sameDirectionY) {
      addScore(200);
      g.reset();
    }
  });
}

//Creating the laser beam
function updateLaserBeam(pac) {
  if (!pac.laserActive || !laserBeamEl) {
    laserBeamEl.style.opacity = "0";
    return;
  }

  //description of laser beam
  const beamLength = 400; 
  const beamThickness = 6; 
  const mouthOffset = pac.tile / 2 - 2; //Position of the beam

  const dx = pac.dir.c;
  const dy = pac.dir.r;

  const dirX = (dx === 0 && dy === 0) ? 1 : dx;
  const dirY = (dx === 0 && dy === 0) ? 0 : dy;

  const mouthX = pac.x + dirX * mouthOffset;
  const mouthY = pac.y + dirY * mouthOffset;

  //Laser rotation based on Pac-man movement
  let angleDeg = 0;
  if (dirX === 1 && dirY === 0) angleDeg = 0;
  else if (dirX === -1 && dirY === 0) angleDeg = 180;
  else if (dirY === -1 && dirX === 0) angleDeg = -90;
  else if (dirY === 1 && dirX === 0) angleDeg = 90;

  // Update laser position and angle visually
  Object.assign(laserBeamEl.style, {
    position: "absolute",
    left: `${mouthX}px`,
    top: `${mouthY - beamThickness / 2}px`,
    width: `${beamLength}px`,
    height: `${beamThickness}px`,
    transformOrigin: "left center",
    transform: `rotate(${angleDeg}deg)`,
    opacity: "1"
  });
}

let lastTime = performance.now();

function gameLoop(now) {
  const delta = (now - lastTime) / 16.67;
  lastTime = now;

  // Update all game objects
  pac.updatePosition(delta, (r, c) => map.isPassable(r, c), cols);
  map.eatAtTile(pac, addScore, triggerFrightenedMode, onVictory);
  ghosts.forEach(g => g.move(delta, (r, c) => map.isPassable(r, c)));

  //Laser logic
  laserHitDetection(pac); 
  updateLaserBeam(pac);
  //collision detection
  checkGhostCollisions();
  draw(now);

  requestAnimationFrame(gameLoop);
}

//Drawing function
function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.draw(ctx);
  pac.draw(ctx, now);
  ghosts.forEach(g => g.draw(ctx));
}

//Collision check between pac man and ghosts
function checkGhostCollisions() {
  ghosts.forEach(g => {
    const dx = pac.x - g.x;
    const dy = pac.y - g.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < tile / 2) {
      //Pac-man immune to ghost while invisible
      if (pac.invisibleActive) return;
      //Pac-man can kill ghosts in this state and add scores
      if (pac.flashActive) {
        addScore(200);
        g.reset();
        return;
      }
      //When pac-man has eaten a power pellet and add score when eaten a ghost
      if (g.state === "frightened") {
        addScore(200);
        //Ghosts spawn back in middle
        g.reset();
      } else {
        gameOver();
      }
    }
  });
}

//Victory screen
function onVictory() {
  //display final score for user
  localStorage.setItem("currentScore", score);
  const currentUser = localStorage.getItem("loggedInUser");
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    if (score > (userData.topScore || 0)) {
      userData.topScore = score;
      localStorage.setItem(currentUser, JSON.stringify(userData));
    }
  }
  //takes user to victory page
  setTimeout(() => (window.location.href = "victory.html"), 1000);
}

score = 0;
scoreEl.textContent = "Score: " + score;
requestAnimationFrame(gameLoop);

