// Orchestrates the full game loop: initialising players, managing turns,
// detecting win conditions, and notifying the UI of every state change.
import Player from "./player.js";

// Standard Battleship fleet in descending size order
const SHIP_CONFIGS = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Destroyer", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Patrol Boat", length: 2 }
];

class GameController {
  #human;
  #computer;
  #currentTurn;
  #gameOver;
  #winner;
  // Callback invoked with the latest state snapshot after every change
  #onStateChange;

  constructor() {
    this.#human = null;
    this.#computer = null;
    this.#currentTurn = "human";
    this.#gameOver = false;
    this.#winner = null;
    this.#onStateChange = null;
  }

  // Randomly fills a gameboard with all ships from SHIP_CONFIGS.
  // Retries on overlap or out-of-bounds until each ship is successfully placed.
  static placeShipsRandomly(gameboard) {
    const size = gameboard.boardSize;
    SHIP_CONFIGS.forEach(({ length }) => {
      let placed = false;
      while (!placed) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        // Cap the starting position so the ship always fits inside the grid
        const maxRow = direction === "vertical" ? size - length : size - 1;
        const maxCol = direction === "horizontal" ? size - length : size - 1;
        const row = Math.floor(Math.random() * (maxRow + 1));
        const col = Math.floor(Math.random() * (maxCol + 1));
        try {
          gameboard.placeShip(length, [row, col], direction);
          placed = true;
        } catch (_) {
          // Placement failed (overlap) — pick a new position and retry
        }
      }
    });
  }

  // Initialises both players and their boards, then fires the first state update.
  // Pass humanShipPlacements to use manually chosen positions; omit for random.
  startGame(humanShipPlacements = null) {
    this.#human = new Player("human");
    this.#computer = new Player("computer");
    this.#currentTurn = "human";
    this.#gameOver = false;
    this.#winner = null;

    if (humanShipPlacements) {
      // Apply the positions the player chose on the placement screen
      humanShipPlacements.forEach(({ length, coordinates, direction }) => {
        this.#human.gameboard.placeShip(length, coordinates, direction);
      });
    } else {
      GameController.placeShipsRandomly(this.#human.gameboard);
    }

    // The computer always gets a random fleet
    GameController.placeShipsRandomly(this.#computer.gameboard);

    if (this.#onStateChange) this.#onStateChange(this.getState());
  }

  // Processes the human player's chosen attack, then triggers the computer's reply.
  // Silently ignores attacks on already-targeted cells or out-of-turn calls.
  humanAttack(coordinates) {
    if (this.#gameOver || this.#currentTurn !== "human") return;

    try {
      this.#human.attack(this.#computer.gameboard, coordinates);
    } catch (_) {
      return;
    }

    // Check win condition immediately after the human's attack
    if (this.#computer.gameboard.allSunk()) {
      this.#gameOver = true;
      this.#winner = "human";
      if (this.#onStateChange) this.#onStateChange(this.getState());
      return;
    }

    // Hand the turn to the computer and schedule its move after a short delay
    this.#currentTurn = "computer";
    if (this.#onStateChange) this.#onStateChange(this.getState());

    setTimeout(() => {
      this.#computerTurn();
    }, 400);
  }

  // Executes the computer's random attack, then passes the turn back to the human.
  #computerTurn() {
    if (this.#gameOver || this.#currentTurn !== "computer") return;

    this.#computer.randomAttack(this.#human.gameboard);

    // Check win condition immediately after the computer's attack
    if (this.#human.gameboard.allSunk()) {
      this.#gameOver = true;
      this.#winner = "computer";
      if (this.#onStateChange) this.#onStateChange(this.getState());
      return;
    }

    this.#currentTurn = "human";
    if (this.#onStateChange) this.#onStateChange(this.getState());
  }

  // Returns a plain-object snapshot of the current game state for the UI to consume
  getState() {
    return {
      humanBoard: this.#human ? this.#human.gameboard : null,
      computerBoard: this.#computer ? this.#computer.gameboard : null,
      currentTurn: this.#currentTurn,
      gameOver: this.#gameOver,
      winner: this.#winner
    };
  }

  // Registers the UI callback that is called after every state change
  setOnStateChange(cb) {
    this.#onStateChange = cb;
  }

  getShipConfigs() {
    return SHIP_CONFIGS;
  }

  isGameStarted() {
    return this.#human !== null;
  }
}

export default GameController;
