// Manages the interactive ship-placement phase before the game begins.
// Uses event delegation on the board element so the DOM is never re-rendered
// during hover — only CSS classes are toggled to show the preview.
// All required DOM elements are injected via the constructor — no getElementById inside methods.
import Gameboard from "./gameboard.js";

class ShipPlacement {
    #shipConfigs;
    #domController;
    // Callback fired with the final placements array when all ships are placed
    #onComplete;
    // Temporary board used to validate positions and render the preview state
    #tempBoard;
    #currentShipIndex;
    #direction;
    // Accumulated list of {length, coordinates, direction} objects
    #placements;
    #boardEl;
    #infoEl;
    // AbortController whose signal removes all three delegated listeners at once
    #abortController;
    // Tracks the last cell the cursor hovered over so toggleDirection can refresh the preview in place
    #lastHoverRow;
    #lastHoverCol;

    constructor(shipConfigs, domController, onComplete, { boardEl, infoEl }) {
        this.#shipConfigs = shipConfigs;
        this.#domController = domController;
        this.#onComplete = onComplete;
        this.#tempBoard = new Gameboard();
        this.#currentShipIndex = 0;
        this.#direction = "horizontal";
        this.#placements = [];
        this.#boardEl = boardEl;
        this.#infoEl = infoEl;
        this.#abortController = null;
    }

    // Returns the ship config object that is currently being placed
    #getCurrentShip() {
        return this.#shipConfigs[this.#currentShipIndex];
    }

    // Computes the list of [row, col] pairs the current ship would occupy
    // if placed starting at (row, col) in the current direction.
    // Cells that fall outside the grid are excluded, so the caller must
    // compare the result length against the ship length to detect overflow.
    #getPreviewCells(row, col) {
        const { length } = this.#getCurrentShip();
        const size = this.#tempBoard.boardSize;
        const cells = [];
        for (let i = 0; i < length; i++) {
            const r = this.#direction === "vertical" ? row + i : row;
            const c = this.#direction === "horizontal" ? col + i : col;
            if (r >= 0 && r < size && c >= 0 && c < size) {
                cells.push([r, c]);
            }
        }
        return cells;
    }

    // Returns true when the ship fits entirely on the board and none of its
    // cells are occupied by a previously placed ship
    #isValidPlacement(row, col) {
        const { length } = this.#getCurrentShip();
        const cells = this.#getPreviewCells(row, col);
        if (cells.length < length) return false;
        const grid = this.#tempBoard.getGrid();
        return cells.every(([r, c]) => grid[r][c] === null);
    }

    // Removes the hover-preview CSS classes from all cells
    #clearPreview() {
        if (!this.#boardEl) return;
        this.#boardEl.querySelectorAll(".preview, .invalid").forEach((el) => {
            el.classList.remove("preview", "invalid");
        });
    }

    // Highlights the cells the current ship would occupy when placed at (row, col).
    // Adds "invalid" on top of "preview" when the placement would be illegal.
    #showPreview(row, col) {
        this.#clearPreview();
        const cells = this.#getPreviewCells(row, col);
        const valid = this.#isValidPlacement(row, col);
        cells.forEach(([r, c]) => {
            const el = this.#boardEl.querySelector(
                `[data-row="${r}"][data-col="${c}"]`,
            );
            if (el) {
                el.classList.add("preview");
                if (!valid) el.classList.add("invalid");
            }
        });
    }

    // Commits the current ship to the temporary board and advances the index.
    // When the last ship is placed, aborts listeners and fires the onComplete callback.
    #placeCurrent(row, col) {
        if (!this.#isValidPlacement(row, col)) return false;
        const { length } = this.#getCurrentShip();
        this.#tempBoard.placeShip(length, [row, col], this.#direction);
        this.#placements.push({
            length,
            coordinates: [row, col],
            direction: this.#direction,
        });
        this.#currentShipIndex += 1;

        if (this.#currentShipIndex >= this.#shipConfigs.length) {
            // All ships placed — tear down listeners before handing off
            if (this.#abortController) {
                this.#abortController.abort();
                this.#abortController = null;
            }
            this.#onComplete(this.#placements);
            return true;
        }

        // More ships remain — update the info bar and re-render the board
        this.#updateInfo();
        this.#domController.renderPlacementBoard(
            this.#boardEl,
            this.#tempBoard,
        );
        return true;
    }

    // Attaches three delegated listeners to the board element.
    // All share one AbortSignal so they can all be removed in a single abort() call.
    #bindEvents() {
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        // Hover: update the preview highlight as the cursor moves between cells
        this.#boardEl.addEventListener(
            "mouseover",
            (e) => {
                const cell = e.target.closest(".cell");
                if (!cell) return;
                this.#lastHoverRow = parseInt(cell.dataset.row);
                this.#lastHoverCol = parseInt(cell.dataset.col);
                this.#showPreview(this.#lastHoverRow, this.#lastHoverCol);
            },
            { signal },
        );

        // Leave: clear the preview and forget the last hovered position
        this.#boardEl.addEventListener(
            "mouseleave",
            () => {
                this.#lastHoverRow = null;
                this.#lastHoverCol = null;
                this.#clearPreview();
            },
            { signal },
        );

        // Click: attempt to place the current ship at the clicked cell
        this.#boardEl.addEventListener(
            "click",
            (e) => {
                const cell = e.target.closest(".cell");
                if (!cell) return;
                this.#placeCurrent(
                    parseInt(cell.dataset.row),
                    parseInt(cell.dataset.col),
                );
            },
            { signal },
        );
    }

    // Updates the placement-info paragraph with the current ship name and direction
    #updateInfo() {
        const ship = this.#getCurrentShip();
        if (this.#infoEl && ship) {
            this.#infoEl.textContent = `Placing: ${ship.name} (length ${
                ship.length
            }) — Direction: ${this.#direction}`;
        }
    }

    // Initial render: draws the (empty) board, binds events, and updates the info bar
    render() {
        if (!this.#boardEl) return;
        this.#domController.renderPlacementBoard(
            this.#boardEl,
            this.#tempBoard,
        );
        this.#bindEvents();
        this.#updateInfo();
    }

    // Resets all placement state and re-renders from scratch.
    // Used when starting a new game — aborts stale listeners before rebinding.
    refresh() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
        this.#tempBoard = new Gameboard();
        this.#currentShipIndex = 0;
        this.#direction = "horizontal";
        this.#placements = [];
        this.render();
    }

    // Flips the placement direction, refreshes the info bar, and immediately
    // re-draws the hover preview so the new orientation is visible without
    // requiring the cursor to move (fixes the keyboard-R shortcut visual lag).
    toggleDirection() {
        this.#direction =
            this.#direction === "horizontal" ? "vertical" : "horizontal";
        this.#updateInfo();
        if (this.#lastHoverRow !== null && this.#lastHoverCol !== null) {
            this.#showPreview(this.#lastHoverRow, this.#lastHoverCol);
        }
    }
}

export default ShipPlacement;
