// Handles all DOM rendering and UI updates.
// Reads from Gameboard objects and writes to the page; contains no game logic.
// All required DOM elements are injected via the constructor — no getElementById inside methods.
class DomController {
  #gameController;
  #humanBoardEl;
  #computerBoardEl;
  #messageEl;
  #newGameBtnEl;

  constructor(gameController, { humanBoardEl, computerBoardEl, messageEl, newGameBtnEl }) {
    this.#gameController = gameController;
    this.#humanBoardEl = humanBoardEl;
    this.#computerBoardEl = computerBoardEl;
    this.#messageEl = messageEl;
    this.#newGameBtnEl = newGameBtnEl;
  }

  // Renders a 10×10 grid into boardEl from the given gameboard's current state.
  // isEnemy controls whether ship positions are revealed and cells are clickable.
  renderBoard(boardEl, gameboard, isEnemy, onCellClick) {
    boardEl.innerHTML = "";
    const size = gameboard.boardSize;
    const grid = gameboard.getGrid();

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (gameboard.isAttacked(row, col)) {
          // Show hit or miss markers for attacked cells
          if (gameboard.isHit(row, col)) {
            cell.classList.add("hit");
            cell.textContent = "✕";
          } else {
            cell.classList.add("miss");
            cell.textContent = "•";
          }
        } else if (!isEnemy && grid[row][col] !== null && grid[row][col] !== "miss") {
          // Reveal the human player's own ship positions
          cell.classList.add("ship");
        }

        // Enemy cells that have not yet been attacked are made clickable
        if (isEnemy && !gameboard.isAttacked(row, col) && onCellClick) {
          cell.classList.add("attackable");
          cell.addEventListener("click", () => onCellClick([row, col]));
        }

        boardEl.appendChild(cell);
      }
    }
  }

  // Renders the ship-placement grid.
  // Does not attach any event listeners — ShipPlacement handles those via delegation.
  renderPlacementBoard(boardEl, gameboard) {
    boardEl.innerHTML = "";
    const size = gameboard.boardSize;
    const grid = gameboard.getGrid();

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Highlight cells that already contain a placed ship
        const cellData = grid[row][col];
        if (cellData !== null && cellData !== "miss") {
          cell.classList.add("ship");
        }

        boardEl.appendChild(cell);
      }
    }
  }

  // Updates the status message bar with the given text and visual type
  showMessage(msg, type = "info") {
    if (!this.#messageEl) return;
    this.#messageEl.textContent = msg;
    this.#messageEl.className = `message ${type}`;
  }

  // Re-renders both boards and updates the message bar to reflect the current state.
  // Called by GameController's onStateChange callback after every move.
  updateGameUI(state) {
    const { humanBoard, computerBoard, currentTurn, gameOver, winner } = state;

    if (!this.#humanBoardEl || !this.#computerBoardEl) return;

    // Always redraw both boards so hit/miss markers stay in sync
    this.renderBoard(this.#humanBoardEl, humanBoard, false, null);
    this.renderBoard(this.#computerBoardEl, computerBoard, true, (coords) => {
      if (!gameOver && currentTurn === "human") {
        this.#gameController.humanAttack(coords);
      }
    });

    if (gameOver) {
      const winnerText = winner === "human" ? "You win! 🎉" : "Computer wins! 🤖";
      this.showMessage(winnerText, "end");
      // Reveal the New Game button and strip click targets from enemy cells
      if (this.#newGameBtnEl) this.#newGameBtnEl.classList.remove("hidden");
      this.#computerBoardEl.querySelectorAll(".attackable").forEach((cell) => {
        cell.classList.remove("attackable");
      });
    } else {
      const turnText =
        currentTurn === "human" ? "Your turn — click the enemy board" : "Computer is thinking...";
      this.showMessage(turnText, currentTurn === "human" ? "info" : "wait");
    }
  }
}

export default DomController;
