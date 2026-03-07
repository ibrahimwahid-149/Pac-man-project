export class PacMan {
  // Export the PacMan class so it can be imported in other files

  constructor(startR, startC, tile) {
    //Starting tile position
    this.r = startR;
    this.c = startC;
    // Convert tile coordinates into pixel positions
    this.x = startC * tile + tile / 2;
    this.y = startR * tile + tile / 2;
    this.tile = tile;
    // Movement properties
    this.speed = 1; //Normal speed
    this.dir = { r: 0, c: 0 }; //Movement directions
    this.nextDir = { r: 0, c: 0 }; //Next direction input

    // Power-ups
    this.flashActive = false;
    this.invisibleActive = false;
    this.laserActive = false;
    //Colour of pac-man
    this.color = "yellow";
  }

  // Called when the user presses a direction key (WASD or arrow keys)
  setNextDirection(r, c) {
    this.nextDir = { r, c };
  }

  // Try to change direction if Pac-Man is close enough to the center of a tile
  tryChangeDirection(isPassable) {
    if (this.nextDir.r === 0 && this.nextDir.c === 0) return;
    // Calculate how far Pac-Man is from the tile center
    const cx = this.x - (this.c * this.tile + this.tile / 2);
    const cy = this.y - (this.r * this.tile + this.tile / 2);
    const centerThreshold = 2.5;

    // If Pac-Man is near the center, is available to turn
    if (Math.abs(cx) < centerThreshold && Math.abs(cy) < centerThreshold) {
      const nr = this.r + this.nextDir.r;
      const nc = this.c + this.nextDir.c;
      // Check if the next tile is open before turning
      if (isPassable(nr, nc)) {
        this.dir.r = this.nextDir.r;
        this.dir.c = this.nextDir.c;
      }
    }
  }

  //movement logic
  updatePosition(delta, isPassable, cols) {
    //Change direction when possible
    this.tryChangeDirection(isPassable);
    this.x += this.dir.c * this.speed;
    this.y += this.dir.r * this.speed;

    //Tunnel teleport
    const computedCol = Math.floor(this.x / this.tile);
    if (computedCol < 0 || computedCol >= cols) {
      const targetCol = (computedCol < 0) ? (cols - 1) : 0;
      if (isPassable(this.r, targetCol)) {
        this.c = targetCol;
        this.x = this.c * this.tile + this.tile / 2;
      } else {
        this.x = this.c * this.tile + this.tile / 2;
        this.dir.c = 0;
      }
    }

    const centerX = this.c * this.tile + this.tile / 2;
    const centerY = this.r * this.tile + this.tile / 2;

    // Horizontal movement and collision checks
    if (this.dir.c !== 0) {
      if ((this.dir.c > 0 && this.x > centerX + this.tile / 2 - 1) ||
        (this.dir.c < 0 && this.x < centerX - this.tile / 2 + 1)) {
        const newC = this.c + this.dir.c;
        const newR = this.r;
        if (isPassable(newR, newC)) {
          this.c = newC;
          this.x = this.c * this.tile + this.tile / 2;
        } else {
          this.x = this.c * this.tile + this.tile / 2;
          this.dir.c = 0;
        }
      }
    }

    // Vertical movement and collision checks
    if (this.dir.r !== 0) {
      if ((this.dir.r > 0 && this.y > centerY + this.tile / 2 - 1) ||
        (this.dir.r < 0 && this.y < centerY - this.tile / 2 + 1)) {
        const newR = this.r + this.dir.r;
        const newC = this.c;
        if (isPassable(newR, newC)) {
          this.r = newR;
          this.y = this.r * this.tile + this.tile / 2;
        } else {
          this.y = this.r * this.tile + this.tile / 2;
          this.dir.r = 0;
        }
      }
    }
  }

  //Drawing Pac-man
  draw(ctx, time) {
    // Animate the mouth opening and closing
    const t = time / 120;
    const mouth = Math.abs(Math.sin(t)) * 0.35;
    const px = this.x, py = this.y;
    //Mouth open angle
    let startAng = mouth * Math.PI, endAng = 2 * Math.PI - mouth * Math.PI;
    //Rotate pac-man mouth based on direction
    let rot = 0;
    if (this.dir.c === -1) rot = Math.PI;
    else if (this.dir.r === -1) rot = -Math.PI / 2;
    else if (this.dir.r === 1) rot = Math.PI / 2;

    // Draw Pac-Man using arc
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.tile / 2 - 1, startAng, endAng);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  //Power-ups
  //Flash mode - gives speed boost for 5 seconds
  activateFlash(duration, callbackEnd) {
    if (this.flashActive) return;
    this.flashActive = true;
    const originalSpeed = this.speed;
    this.speed = 3;

    //Will go back to original speed once it expires
    setTimeout(() => {
      this.speed = originalSpeed;
      this.flashActive = false;
      if (callbackEnd) callbackEnd();
    }, duration);
  }

  //Invisibility mode - ghosts cannot harm pac-man and lasts for 8 seconds
  activateInvisibility(duration, callbackEnd) {
    if (this.invisibleActive) return;
    this.invisibleActive = true;
    //Will turn purple while active
    this.color = "purple";

    //Pac-man can be harmed by gosts and will turn back to yellow colour
    setTimeout(() => {
      this.color = "yellow";
      this.invisibleActive = false;
      if (callbackEnd) callbackEnd();
    }, duration);
  }

  // Initialize references
  initContext(ctx, ghosts, onLaserHit) {
    this.ctxRef = ctx;
    this.ghostsRef = ghosts;
    this.onLaserHit = onLaserHit;
  }

  //Laser mode - shoots a horizontal or vertical orannge laser beam that kills ghost that collide with it.
  //Lasts or 5 seconds
  activateLaser(duration, callbackEnd) {
    if (this.laserActive) return;
    this.laserActive = true;

    //Laser will dissappear
    setTimeout(() => {
      this.laserActive = false;
      if (callbackEnd) callbackEnd();
    }, duration);
  }
}



