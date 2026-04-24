# Battleship Game — Project Task

We're going to implement the classic game **Battleship**. If you've never played it, or need a refresher, you can read about [Battleship's rules](https://en.wikipedia.org/wiki/Battleship_(game)) and play an online version.

> Since we're doing **TDD**, it's important that you don't get overwhelmed. Take it one step at a time — write a test, then make it pass. If you are unsure what to test or how to approach testing, consider revisiting the ideas and assignments from the *More Testing* lesson.

> We have not yet discussed testing the appearance of a webpage, which requires a separate set of tools and is outside the scope of this unit. **Do not test the DOM** for this assignment. Instead, isolate every bit of application functionality from the actual DOM manipulation bits.

---

## Setup

### Jest and ESM

Remember that Jest does not have built-in stable support for ESM, so you will need to set up **Babel** for Jest ESM/CJS conversion.

---

## Assignment

### 1. Ship Class/Factory

Begin your app by creating the `Ship` class/factory (your choice).

- Ships are objects that include:
  - their **length**
  - the number of times they've been **hit**
  - whether or not they've been **sunk**
- Implement a `hit()` method that increases the hit count.
- Implement `isSunk()` — a method that calculates whether a ship is sunk based on its length and the number of hits received.

> **Remember:** you only have to test your object's **public interface**. Only methods or properties used outside of the ship object need unit tests.

---

### 2. Gameboard Class/Factory

> You shouldn't be relying on `console.log` or DOM methods to verify your code — use tests instead.

- `placeShip(coordinates)` — place ships at specific coordinates by calling the ship factory/class.
- `receiveAttack(coordinates)` — determines whether the attack hit a ship, then either calls `hit()` on the correct ship or records the coordinates of the missed shot.
- Track **missed attacks** so they can be displayed properly.
- Report whether or not **all ships have been sunk**.

---

### 3. Player Class/Factory

- There will be two types of players: **real** players and **computer** players.
- Each player object should contain its own `Gameboard`.

---

### 4. Game Logic & DOM Module

- Import your classes/factories into a separate file and drive the game using **event listeners**.
- Create a module to manage **DOM-related actions**.

#### UI Setup

- Set up a new game by creating `Player` instances.
- Populate each player's `Gameboard` with **predetermined coordinates** for now (ship placement UI comes later).
- Display **both player boards** rendered from `Gameboard` data.
- Add methods to **render each player's Gameboard** in an appropriate module.

#### Gameplay

- Let the user **click on a coordinate** in the enemy Gameboard to attack.
- Send user input to object methods, then **re-render** the boards.
- Players take turns attacking the enemy Gameboard.
- Track the **current player's turn** within this module.

#### Computer Player

- Make the computer capable of **random plays**.
- The computer must not shoot the **same coordinate twice**.

#### End Condition

- End the game once **one player's ships have all been sunk**.

---

### 5. Ship Placement

Implement a system that allows players to **place their ships**:

- Allow players to type coordinates for each ship, **or**
- Provide a button to cycle through **random placements**.

---

## Extra Credit

Make your Battleship project more impressive by introducing any of these modifications:

- Implement **drag and drop** to allow players to place their ships.
- Create a **2-player option** that lets users take turns by passing the device — implement a *"pass device"* screen so players don't see each other's boards.
- **Polish the computer AI** by having it try adjacent slots after getting a hit.
