import Ship from "../ship.js";

describe("Ship class", () => {
  test("has correct length", () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
  });

  test("starts with 0 hits", () => {
    const ship = new Ship(3);
    expect(ship.getHits()).toBe(0);
  });

  test("hit() increases hit count", () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.getHits()).toBe(1);
  });

  test("hit() can be called multiple times", () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    expect(ship.getHits()).toBe(2);
  });

  test("isSunk() returns false when not enough hits", () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk() returns true when hits equal length", () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test("isSunk() returns true for ship of length 1 after one hit", () => {
    const ship = new Ship(1);
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test("isSunk() returns false for new ship", () => {
    const ship = new Ship(4);
    expect(ship.isSunk()).toBe(false);
  });
});
