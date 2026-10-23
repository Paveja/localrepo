import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMove,
  chooseComputerMove,
  emptyBoard,
  findWinningLine,
  getWinner,
  incrementScore,
  isDraw,
} from "../src/lib/game-logic.mjs";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

test("starts with nine empty squares", () => {
  assert.deepEqual(emptyBoard(), Array(9).fill(null));
});

test("finds each horizontal, vertical, and diagonal win", () => {
  for (const line of winningLines) {
    const board = emptyBoard();

    for (const index of line) {
      board[index] = "X";
    }

    assert.equal(getWinner(board), "X");
    assert.deepEqual(findWinningLine(board), line);
  }
});

test("recognizes a full board without a winner as a draw", () => {
  const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

  assert.equal(getWinner(board), null);
  assert.equal(isDraw(board), true);
});

test("accepts a legal move without mutating the original board", () => {
  const board = emptyBoard();
  const nextBoard = applyMove(board, 4, "X");

  assert.deepEqual(nextBoard, [
    null,
    null,
    null,
    null,
    "X",
    null,
    null,
    null,
    null,
  ]);
  assert.deepEqual(board, emptyBoard());
});

test("rejects occupied, out-of-range, fractional, and invalid-mark moves", () => {
  const board = ["X", null, null, null, null, null, null, null, null];

  assert.equal(applyMove(board, 0, "O"), null);
  assert.equal(applyMove(board, -1, "O"), null);
  assert.equal(applyMove(board, 2.5, "O"), null);
  assert.equal(applyMove(board, 1, "Z"), null);
});

test("rejects moves after a win or draw", () => {
  const wonBoard = ["X", "X", "X", "O", "O", null, null, null, null];
  const drawnBoard = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

  assert.equal(applyMove(wonBoard, 5, "X"), null);
  assert.equal(applyMove(drawnBoard, 8, "O"), null);
});

test("computer takes an available winning move", () => {
  const board = ["O", "O", null, "X", "X", null, null, null, null];

  assert.equal(chooseComputerMove(board), 2);
});

test("computer blocks an opponent's immediate win", () => {
  const board = ["X", "X", null, "O", null, null, null, null, null];

  assert.equal(chooseComputerMove(board), 2);
});

test("computer chooses only an empty square and stops after the game ends", () => {
  const board = ["X", null, null, null, "O", null, null, null, null];
  const computerMove = chooseComputerMove(board);

  assert.notEqual(computerMove, null);
  assert.equal(board[computerMove], null);
  assert.equal(
    chooseComputerMove(["X", "X", "X", "O", "O", null, null, null, null]),
    null,
  );
  assert.equal(
    chooseComputerMove(["X", "O", "X", "X", "O", "O", "O", "X", "X"]),
    null,
  );
});

test("updates wins and draws without changing the previous score", () => {
  const score = { x: 1, o: 2, draws: 3 };

  assert.deepEqual(incrementScore(score, "X"), { x: 2, o: 2, draws: 3 });
  assert.deepEqual(incrementScore(score, "O"), { x: 1, o: 3, draws: 3 });
  assert.deepEqual(incrementScore(score, "draw"), { x: 1, o: 2, draws: 4 });
  assert.deepEqual(score, { x: 1, o: 2, draws: 3 });
});
