export class Ghost {
  // Export the Ghost class so it can be imported into other scripts
  constructor(r, c, tile, color) {
    //Starting tile position
    this.r = r;
    this.c = c;
    // Convert tile coordinates into pixel positions
    this.x = c * tile + tile / 2;
    this.y = r * tile + tile / 2;
    //Properties 
    this.tile = tile;
    this.color = color; //Ghost colours
    this.speed = 1.5; //Movement speed
    this.state = "chasing"; //Normal state
    this.dir = this.randomDirection(); //Pick a randon starting direction
  }

  //They move randomly, up, down, left and right
  randomDirection() {
    const dirs = [
      { r: -1, c: 0 }, //up
      { r: 1, c: 0 }, //down
      { r: 0, c: -1 }, //left
      { r: 0, c: 1 } //right
    ];
    // Randomly select one direction
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  //Movement logic
  move(delta, isPassable) {
    // Calculate new position
    const nextX = this.x + this.dir.c * this.speed * delta;
    const nextY = this.y + this.dir.r * this.speed * delta;

    const nextCol = Math.floor(nextX / this.tile);
    const nextRow = Math.floor(nextY / this.tile);

    // If next position hits a wall, stop and choose a new direction
    if (!isPassable(nextRow, nextCol)) {
      this.x = this.c * this.tile + this.tile / 2;
      this.y = this.r * this.tile + this.tile / 2;
      // Pick a new valid direction
      this.dir = this.getRandomValidDirection(isPassable);
    } else {
      // Move to next position
      this.x = nextX;
      this.y = nextY;
      // Update current row and column
      this.c = Math.floor(this.x / this.tile);
      this.r = Math.floor(this.y / this.tile);
    }
  }

  // Ensures ghost doesn't go directly back the way it came
  getRandomValidDirection(isPassable) {
    const dirs = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];

    // Opposite direction (to avoid backtracking)
    const opposite = { r: -this.dir.r, c: -this.dir.c };
     // Filter out blocked or opposite directions
    const valid = dirs.filter(d => {
      if (d.r === opposite.r && d.c === opposite.c) return false;
      return isPassable(this.r + d.r, this.c + d.c);
    });

    // Choose random valid direction, or reverse if no valid options
    return valid.length ? valid[Math.floor(Math.random() * valid.length)] : opposite;
  }

  //Called when pac-man eats a power pellet
  frighten(duration) {
    this.state = "frightened"; //Now is blue colour
    this.speed = 0.5; //Changed speed to slow
    //after a certain amont of time change back to normal state
    setTimeout(() => {
      if (this.state === "frightened") {
        this.state = "chasing";
        this.speed = 1.5;
      }
    }, duration);
  }

  // Sends ghost back to start position (when eliminated by pac-man)
  reset() {
    this.r = 15;
    this.c = 14;
    this.x = this.c * this.tile + this.tile / 2;
    this.y = this.r * this.tile + this.tile / 2;
    this.state = "chasing";
  }

  draw(ctx) {
    // If frightened, tehy will turn blue instead of original color
    ctx.fillStyle = (this.state === "frightened") ? "blue" : this.color;
    //Draw the body of te ghosts
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.tile / 2 - 1, Math.PI, 0);
    ctx.lineTo(this.x + this.tile / 2 - 1, this.y + this.tile / 2 - 2);
    ctx.lineTo(this.x - this.tile / 2 + 1, this.y + this.tile / 2 - 2);
    ctx.closePath();
    ctx.fill();
  }
}
