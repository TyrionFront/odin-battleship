import Gameboard from "../gameboard.js";

describe("Gameboard class", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  describe("placeShip()", () => {
    test("places a ship and returns it", () => {
      const ship = board.placeShip(3, [0, 0]);
      expect(ship).toBeDefined();
      expect(ship.length).toBe(3);
    });

    test("places ship horizontally by default", () => {
      board.placeShip(3, [0, 0]);
      const grid = board.getGrid();
      expect(grid[0][0]).not.toBeNull();
      expect(grid[0][1]).not.toBeNull();
      expect(grid[0][2]).not.toBeNull();
    });

    test("places ship vertically", () => {
      board.placeShip(3, [0, 0], "vertical");
      const grid = board.getGrid();
      expect(grid[0][0]).not.toBeNull();
      expect(grid[1][0]).not.toBeNull();
      expect(grid[2][0]).not.toBeNull();
    });

    test("throws when ship is out of bounds", () => {
      expect(() => board.placeShip(3, [0, 9])).toThrow();
    });

    test("throws when ship overlaps another ship", () => {
      board.placeShip(3, [0, 0]);
      expect(() => board.placeShip(3, [0, 1])).toThrow();
    });
  });

  describe("receiveAttack()", () => {
    test("returns false on miss", () => {
      const result = board.receiveAttack([0, 0]);
      expect(result).toBe(false);
    });

    test("records missed attacks", () => {
      board.receiveAttack([0, 0]);
      board.receiveAttack([1, 1]);
      expect(board.getMissedAttacks()).toHaveLength(2);
    });

    test("returns true on hit", () => {
      board.placeShip(3, [0, 0]);
      const result = board.receiveAttack([0, 1]);
      expect(result).toBe(true);
    });

    test("calls hit() on the correct ship", () => {
      const ship = board.placeShip(3, [0, 0]);
      board.receiveAttack([0, 0]);
      expect(ship.getHits()).toBe(1);
    });

    test("does not record hit as missed attack", () => {
      board.placeShip(3, [0, 0]);
      board.receiveAttack([0, 0]);
      expect(board.getMissedAttacks()).toHaveLength(0);
    });
  });

  describe("allSunk()", () => {
    test("returns false when ships are not all sunk", () => {
      board.placeShip(3, [0, 0]);
      board.receiveAttack([0, 0]);
      expect(board.allSunk()).toBe(false);
    });

    test("returns true when all ships are sunk", () => {
      board.placeShip(2, [0, 0]);
      board.receiveAttack([0, 0]);
      board.receiveAttack([0, 1]);
      expect(board.allSunk()).toBe(true);
    });

    test("returns false when no ships placed", () => {
      expect(board.allSunk()).toBe(false);
    });

    test("returns true only after all ships sunk (multiple ships)", () => {
      board.placeShip(2, [0, 0]);
      board.placeShip(2, [2, 0]);
      board.receiveAttack([0, 0]);
      board.receiveAttack([0, 1]);
      expect(board.allSunk()).toBe(false);
      board.receiveAttack([2, 0]);
      board.receiveAttack([2, 1]);
      expect(board.allSunk()).toBe(true);
    });
  });

  describe("isAttacked() / isHit()", () => {
    test("isAttacked returns true for missed cell", () => {
      board.receiveAttack([3, 3]);
      expect(board.isAttacked(3, 3)).toBe(true);
    });

    test("isAttacked returns true for hit cell", () => {
      board.placeShip(2, [5, 5]);
      board.receiveAttack([5, 5]);
      expect(board.isAttacked(5, 5)).toBe(true);
    });

    test("isHit returns true for hit cell", () => {
      board.placeShip(2, [5, 5]);
      board.receiveAttack([5, 5]);
      expect(board.isHit(5, 5)).toBe(true);
    });

    test("isHit returns false for missed cell", () => {
      board.receiveAttack([3, 3]);
      expect(board.isHit(3, 3)).toBe(false);
    });
  });
});
