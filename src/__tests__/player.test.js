import Player from "../player.js";

describe("Player class", () => {
  test("has a gameboard", () => {
    const player = new Player("human");
    expect(player.gameboard).toBeDefined();
  });

  test("type property is set correctly", () => {
    const human = new Player("human");
    const computer = new Player("computer");
    expect(human.type).toBe("human");
    expect(computer.type).toBe("computer");
  });

  describe("attack()", () => {
    test("attacks opponent board and returns false on miss", () => {
      const human = new Player("human");
      const opponent = new Player("computer");
      const result = human.attack(opponent.gameboard, [0, 0]);
      expect(result).toBe(false);
    });

    test("tracks attacked coordinates", () => {
      const human = new Player("human");
      const opponent = new Player("computer");
      human.attack(opponent.gameboard, [0, 0]);
      const coords = human.getAttackedCoords();
      expect(coords.has("0,0")).toBe(true);
    });

    test("throws when attacking same coordinate twice", () => {
      const human = new Player("human");
      const opponent = new Player("computer");
      human.attack(opponent.gameboard, [0, 0]);
      expect(() => human.attack(opponent.gameboard, [0, 0])).toThrow();
    });

    test("returns true when hitting a ship", () => {
      const human = new Player("human");
      const opponent = new Player("computer");
      opponent.gameboard.placeShip(3, [0, 0]);
      const result = human.attack(opponent.gameboard, [0, 0]);
      expect(result).toBe(true);
    });
  });

  describe("randomAttack()", () => {
    test("attacks a valid coordinate without throwing", () => {
      const computer = new Player("computer");
      const opponent = new Player("human");
      expect(() => computer.randomAttack(opponent.gameboard)).not.toThrow();
    });

    test("never attacks the same coordinate twice", () => {
      const computer = new Player("computer");
      const opponent = new Player("human");
      const size = opponent.gameboard.boardSize;
      const totalCells = size * size;

      for (let i = 0; i < totalCells; i++) {
        computer.randomAttack(opponent.gameboard);
      }

      expect(computer.getAttackedCoords().size).toBe(totalCells);
    });

    test("can hit a ship", () => {
      const computer = new Player("computer");
      const opponent = new Player("human");
      opponent.gameboard.placeShip(10, [0, 0]);

      let hitFound = false;
      for (let i = 0; i < 10; i++) {
        const result = computer.randomAttack(opponent.gameboard);
        if (result === true) {
          hitFound = true;
          break;
        }
      }
      expect(hitFound).toBe(true);
    });
  });
});
