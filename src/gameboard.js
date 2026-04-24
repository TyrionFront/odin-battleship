// Represents a 10×10 grid that holds ships and records attacks.
import Ship from "./ship.js";

const BOARD_SIZE = 10;

class Gameboard {
  #grid;
  #missedAttacks;
  #ships;

  constructor() {
    this.boardSize = BOARD_SIZE;
    // Fill every cell with null to indicate it is empty and unattacked
    this.#grid = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null)
    );
    this.#missedAttacks = [];
    this.#ships = [];
  }

  // Returns true only when both row and column fall inside the grid
  #isValidCoord(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  // Creates a new Ship and writes a reference to it into every cell it occupies.
  // Throws if the placement falls outside the grid or overlaps an existing ship.
  placeShip(length, coordinates, direction = "horizontal") {
    const ship = new Ship(length);
    const shipCells = [];

    // Calculate and validate every cell the ship would occupy before writing anything
    for (let i = 0; i < length; i++) {
      const row = direction === "vertical" ? coordinates[0] + i : coordinates[0];
      const col = direction === "horizontal" ? coordinates[1] + i : coordinates[1];

      if (!this.#isValidCoord(row, col)) {
        throw new Error("Ship placement out of bounds");
      }
      if (this.#grid[row][col] !== null) {
        throw new Error("Ship placement overlaps another ship");
      }

      shipCells.push([row, col]);
    }

    // All cells are valid — commit the ship to the grid
    shipCells.forEach(([row, col]) => {
      this.#grid[row][col] = ship;
    });

    this.#ships.push(ship);
    return ship;
  }

  // Processes one attack at the given coordinates.
  // Returns true on a hit, false on a miss.
  receiveAttack(coordinates) {
    const [row, col] = coordinates;

    if (!this.#isValidCoord(row, col)) {
      throw new Error("Attack coordinates out of bounds");
    }

    if (this.isAttacked(row, col)) {
      throw new Error("Coordinate already attacked");
    }

    const cell = this.#grid[row][col];

    if (cell instanceof Ship) {
      // Hit: notify the ship and replace the Ship reference with a hit marker
      cell.hit();
      this.#grid[row][col] = { ship: cell, hit: true };
      return true;
    } else {
      // Miss: record the coordinate and mark the cell
      this.#missedAttacks.push(coordinates);
      this.#grid[row][col] = "miss";
      return false;
    }
  }

  // Returns true when every ship on the board has been sunk
  allSunk() {
    return this.#ships.length > 0 && this.#ships.every((ship) => ship.isSunk());
  }

  // Returns a copy of the missed-attack coordinates array
  getMissedAttacks() {
    return [...this.#missedAttacks];
  }

  // Returns a shallow copy of the grid so callers cannot mutate internal state
  getGrid() {
    return this.#grid.map((row) => [...row]);
  }

  getShips() {
    return [...this.#ships];
  }

  // True if the cell has already been attacked (hit or miss)
  isAttacked(row, col) {
    const cell = this.#grid[row][col];
    return (
      cell === "miss" ||
      (cell !== null && typeof cell === "object" && cell.hit === true)
    );
  }

  // True only when the cell was attacked and contained a ship
  isHit(row, col) {
    const cell = this.#grid[row][col];
    return (
      cell !== null && typeof cell === "object" && cell.hit === true
    );
  }
}

export default Gameboard;
