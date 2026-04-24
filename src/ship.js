// Represents a single ship on the board.
// Tracks how many times it has been hit and whether it is sunk.
class Ship {
  #hits = 0;

  constructor(length) {
    // The number of cells this ship occupies
    this.length = length;
  }

  // Register one hit against this ship
  hit() {
    this.#hits += 1;
  }

  // A ship is sunk when every cell has been hit
  isSunk() {
    return this.#hits >= this.length;
  }

  getHits() {
    return this.#hits;
  }
}

export default Ship;
