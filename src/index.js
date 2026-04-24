// Entry point — wires the game classes together and drives the UI flow.
// All DOM elements are queried here and passed down as constructor arguments
// or used directly in closures, so no class method needs to call getElementById.
import GameController from "./gameController.js";
import DomController from "./domController.js";
import ShipPlacement from "./shipPlacement.js";
import "./styles.css";

// --- Element references (single source of truth for all DOM queries) ---
const placementScreenEl = document.getElementById("placement-screen");
const gameScreenEl = document.getElementById("game-screen");
const placementBoardEl = document.getElementById("placement-board");
const placementInfoEl = document.getElementById("placement-info");
const humanBoardEl = document.getElementById("human-board");
const computerBoardEl = document.getElementById("computer-board");
const messageEl = document.getElementById("message");
const newGameBtnEl = document.getElementById("new-game-btn");
const rotateBtnEl = document.getElementById("rotate-btn");
const randomPlacementBtnEl = document.getElementById("random-placement-btn");

// --- Class instantiation ---
const gameController = new GameController();
const domController = new DomController(gameController, {
  humanBoardEl,
  computerBoardEl,
  messageEl,
  newGameBtnEl
});

// The single ShipPlacement instance, created on first visit and refreshed on replay
let shipPlacer = null;

// Shows the placement screen and either creates or refreshes the ship placer
const showPlacementScreen = () => {
  placementScreenEl.classList.remove("hidden");
  gameScreenEl.classList.add("hidden");
  newGameBtnEl.classList.add("hidden");

  if (shipPlacer) {
    // Reuse the existing instance — abort stale listeners and reset state
    shipPlacer.refresh();
  } else {
    // First run — create the placer and bind it to the game start callback
    shipPlacer = new ShipPlacement(
      gameController.getShipConfigs(),
      domController,
      (placements) => startGame(placements),
      { boardEl: placementBoardEl, infoEl: placementInfoEl }
    );
    shipPlacer.render();
  }
};

// Hides the placement screen and reveals the game boards
const showGameScreen = () => {
  placementScreenEl.classList.add("hidden");
  gameScreenEl.classList.remove("hidden");
};

// Starts a new game round with the given ship positions (null = random)
const startGame = (humanShipPlacements) => {
  // Subscribe the DOM controller to every subsequent state change
  gameController.setOnStateChange((state) => {
    domController.updateGameUI(state);
  });
  gameController.startGame(humanShipPlacements);
  showGameScreen();
  // Perform an initial render so the boards are visible before the first move
  domController.updateGameUI(gameController.getState());
};

// Rotate button toggles the current ship's orientation
rotateBtnEl.addEventListener("click", () => {
  if (shipPlacer) shipPlacer.toggleDirection();
});

// Random Placement button skips manual placement and starts immediately
randomPlacementBtnEl.addEventListener("click", () => {
  startGame(null);
});

// New Game button returns to the placement screen
newGameBtnEl.addEventListener("click", () => {
  showPlacementScreen();
});

// Keyboard shortcut: R key also rotates the current ship during placement
document.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") {
    if (shipPlacer && !placementScreenEl.classList.contains("hidden")) {
      shipPlacer.toggleDirection();
    }
  }
});

// Kick off the game by showing the placement screen on page load
showPlacementScreen();
