/** @typedef {"X" | "O"} Mark */
/** @typedef {(Mark | null)[]} Board */
/** @typedef {Mark | "draw"} Result */
/** @typedef {{ x: number; o: number; draws: number }} Score */

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** @returns {Board} */
export function emptyBoard() {
  return Array(9).fill(null);
}

/** @param {Board} board @returns {number[] | null} */
export function findWinningLine(board) {
  if (!Array.isArray(board) || board.length !== 9) {
    return null;
  }

  return (
    WIN_LINES.find(([first, second, third]) => {
      const mark = board[first];
      return (
        mark !== null &&
        mark !== undefined &&
        mark === board[second] &&
        mark === board[third]
      );
    }) ?? null
  );
}

/** @param {Board} board @returns {Mark | null} */
export function getWinner(board) {
  const line = findWinningLine(board);
  return line ? board[line[0]] : null;
}

/** @param {Board} board @returns {boolean} */
export function isDraw(board) {
  return (
    Array.isArray(board) &&
    board.length === 9 &&
    getWinner(board) === null &&
    board.every((cell) => cell !== null)
  );
}

/** @param {Board} board @param {number} index @param {Mark} mark @returns {Board | null} */
export function applyMove(board, index, mark) {
  if (
    !Array.isArray(board) ||
    board.length !== 9 ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 8 ||
    (mark !== "X" && mark !== "O") ||
    board[index] !== null ||
    getWinner(board) !== null ||
    isDraw(board)
  ) {
    return null;
  }

  const nextBoard = [...board];
  nextBoard[index] = mark;
  return nextBoard;
}

/** @param {Board} board @param {Score} score @param {Result} result @returns {Score} */
export function incrementScore(score, result) {
  if (result === "draw") {
    return { ...score, draws: score.draws + 1 };
  }

  const key = result.toLowerCase();
  return { ...score, [key]: score[key] + 1 };
}

/** @param {number[]} moves @returns {number} */
function chooseRandom(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

/** @param {Board} board @returns {number | null} */
export function chooseComputerMove(board) {
  if (
    !Array.isArray(board) ||
    board.length !== 9 ||
    getWinner(board) !== null ||
    isDraw(board)
  ) {
    return null;
  }

  const availableMoves = board
    .map((mark, index) => (mark === null ? index : -1))
    .filter((index) => index >= 0);

  if (availableMoves.length === 0) {
    return null;
  }

  const winningMoves = availableMoves.filter((index) => {
    const nextBoard = applyMove(board, index, "O");
    return nextBoard !== null && getWinner(nextBoard) === "O";
  });

  if (winningMoves.length > 0) {
    return chooseRandom(winningMoves);
  }

  const blockingMoves = availableMoves.filter((index) => {
    const opponentBoard = applyMove(board, index, "X");
    return opponentBoard !== null && getWinner(opponentBoard) === "X";
  });

  if (blockingMoves.length > 0) {
    return chooseRandom(blockingMoves);
  }

  for (const preferredSquares of [[4], [0, 2, 6, 8], [1, 3, 5, 7]]) {
    const preferredMoves = availableMoves.filter((index) =>
      preferredSquares.includes(index),
    );

    if (preferredMoves.length > 0) {
      return chooseRandom(preferredMoves);
    }
  }

  return chooseRandom(availableMoves);
}
