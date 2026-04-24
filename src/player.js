// Represents either a human or computer player.
// Each player owns a Gameboard and tracks which coordinates they have already attacked.
import Gameboard from "./gameboard.js";

class Player {
  // Set of "row,col" strings used to prevent attacking the same cell twice
  #attackedCoords;

  constructor(type = "human") {
    this.type = type;
    this.gameboard = new Gameboard();
    this.#attackedCoords = new Set();
  }

  // Human attack: fires at the given coordinates on the opponent's board.
  // Throws if the coordinate was already targeted.
  attack(opponentBoard, coordinates) {
    const key = coordinates.join(",");
    if (this.#attackedCoords.has(key)) {
      throw new Error("Coordinate already attacked");
    }
    this.#attackedCoords.add(key);
    return opponentBoard.receiveAttack(coordinates);
  }

  // Computer attack: picks a random cell that has not been targeted yet.
  // Loops until a fresh coordinate is found, guaranteeing no repeats.
  randomAttack(opponentBoard) {
    const size = opponentBoard.boardSize;
    let row, col, key;

    do {
      row = Math.floor(Math.random() * size);
      col = Math.floor(Math.random() * size);
      key = `${row},${col}`;
    } while (this.#attackedCoords.has(key));

    this.#attackedCoords.add(key);
    return opponentBoard.receiveAttack([row, col]);
  }

  // Returns a copy of the attacked-coordinates set so callers cannot mutate it
  getAttackedCoords() {
    return new Set(this.#attackedCoords);
  }
}

export default Player;
