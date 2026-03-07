export class GameMap {
  // Export the GameMap class so it can be imported and used in other scripts

  constructor(rawMap, tile) {
    //Store the rawMap layout
    this.rawMap = rawMap;
    this.tile = tile;
    this.rows = rawMap.length; //number of rows
    this.cols = rawMap[0].length; //number of columns

    this.WALL = 1; // Represents walls (‘#’)
    this.PELLET = 2; // Represents small dots (‘.’)
    this.EMPTY = 0; // Represents empty floor (‘ ’)
    this.POWER = 3; // Represents power pellets (‘o’)

    // Create storage for the map’s grid data
    this.grid = [];
    this.pelletsLeft = 0;
    this.buildGrid();
  }

  // Converts the text map into a 2D grid of numeric tile types
  buildGrid() {
    for (let r = 0; r < this.rows; r++) {
      const line = this.rawMap[r] || ''.padEnd(this.cols, ' ');
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const ch = line[c] || ' ';
        if (ch === '#') row.push(this.WALL);
        else if (ch === '.') { row.push(this.PELLET); this.pelletsLeft++; }
        else if (ch === 'o') { row.push(this.POWER); this.pelletsLeft++; }
        else row.push(this.EMPTY);
      }
      this.grid.push(row);
    }
  }

  // Checks if Pac-Man or a ghost can move into a given tile
  isPassable(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
    return this.grid[r][c] !== this.WALL;
  }

  // Handles logic for Pac-Man eating pellets 
  eatAtTile(pac, addScore, triggerFrightenedMode, onVictory) {
    const centerThreshold = 3;
    const cx = pac.x - (pac.c * this.tile + this.tile / 2);
    const cy = pac.y - (pac.r * this.tile + this.tile / 2);

    // Ensure Pac-Man is centered in the tile before eating
    if (Math.abs(cx) < centerThreshold && Math.abs(cy) < centerThreshold) {
      const tileValue = this.grid[pac.r][pac.c];

      //Eats normal pellet
      if (tileValue === this.PELLET) {
        this.grid[pac.r][pac.c] = this.EMPTY;
        this.pelletsLeft--;
        addScore(10);
      //Eats power pellet
      } else if (tileValue === this.POWER) {
        this.grid[pac.r][pac.c] = this.EMPTY;
        this.pelletsLeft--;
        addScore(50);
        triggerFrightenedMode();
      }

      //No pellets left will take user to victory page
      if (this.pelletsLeft <= 0 && onVictory) {
        onVictory();
      }
    }
  }

  // Renders the full maze, pellets, and power pellets on the canvas
  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.grid[r][c];
        const x = c * this.tile, y = r * this.tile;

        //Draws wall
        if (t === this.WALL) {
          ctx.fillStyle = "#001f7f";
          ctx.fillRect(x, y, this.tile, this.tile);
        //Draws pellets and floor
        } else {
          ctx.fillStyle = "#000";
          ctx.fillRect(x, y, this.tile, this.tile);
          if (t === this.PELLET) {
            //pellets are small white dots
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(x + this.tile / 2, y + this.tile / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (t === this.POWER) {
            //Power pellets are golden and bigger than normal pellets
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.arc(x + this.tile / 2, y + this.tile / 2, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }
}

