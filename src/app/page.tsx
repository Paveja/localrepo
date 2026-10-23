"use client";

import { useEffect, useState } from "react";
import {
  applyMove,
  chooseComputerMove,
  emptyBoard,
  findWinningLine,
  getWinner,
  incrementScore,
  isDraw,
} from "@/lib/game-logic.mjs";

type Mark = "X" | "O";
type Mode = "computer" | "friends";
type Score = { x: number; o: number; draws: number };
type Scores = Record<Mode, Score>;

const emptyScore = (): Score => ({ x: 0, o: 0, draws: 0 });

export default function Home() {
  const [mode, setMode] = useState<Mode>("computer");
  const [board, setBoard] = useState<(Mark | null)[]>(() => emptyBoard());
  const [nextMark, setNextMark] = useState<Mark>("X");
  const [scores, setScores] = useState<Scores>(() => ({
    computer: emptyScore(),
    friends: emptyScore(),
  }));

  const winner = getWinner(board);
  const winningLine = findWinningLine(board) ?? [];
  const draw = !winner && isDraw(board);
  const computerTurn =
    mode === "computer" && nextMark === "O" && !winner && !draw;

  useEffect(() => {
    if (!computerTurn) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const computerIndex = chooseComputerMove(board);

      if (computerIndex === null) {
        return;
      }

      const nextBoard = applyMove(board, computerIndex, "O");

      if (!nextBoard) {
        return;
      }

      setBoard(nextBoard);

      const computerWinner = getWinner(nextBoard);

      if (computerWinner) {
        setScores((currentScores) => ({
          ...currentScores,
          computer: incrementScore(currentScores.computer, computerWinner),
        }));
        return;
      }

      if (isDraw(nextBoard)) {
        setScores((currentScores) => ({
          ...currentScores,
          computer: incrementScore(currentScores.computer, "draw"),
        }));
        return;
      }

      setNextMark("X");
    }, 360);

    return () => window.clearTimeout(timeout);
  }, [board, computerTurn]);

  function startNewRound() {
    setBoard(emptyBoard());
    setNextMark("X");
  }

  function chooseMode(nextMode: Mode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    startNewRound();
  }

  function handleCellClick(index: number) {
    if (winner || draw || computerTurn) {
      return;
    }

    const nextBoard = applyMove(board, index, nextMark);

    if (!nextBoard) {
      return;
    }

    setBoard(nextBoard);

    const roundWinner = getWinner(nextBoard);

    if (roundWinner) {
      setScores((currentScores) => ({
        ...currentScores,
        [mode]: incrementScore(currentScores[mode], roundWinner),
      }));
      return;
    }

    if (isDraw(nextBoard)) {
      setScores((currentScores) => ({
        ...currentScores,
        [mode]: incrementScore(currentScores[mode], "draw"),
      }));
      return;
    }

    setNextMark(nextMark === "X" ? "O" : "X");
  }

  function resetScore() {
    setScores((currentScores) => ({
      ...currentScores,
      [mode]: emptyScore(),
    }));
  }

  let statusMessage: string;

  if (winner) {
    statusMessage =
      mode === "computer"
        ? winner === "X"
          ? "You win this round!"
          : "Computer wins this round."
        : `Player ${winner} wins this round!`;
  } else if (draw) {
    statusMessage = "A draw. Nice defense.";
  } else if (computerTurn) {
    statusMessage = "Computer is thinking…";
  } else if (mode === "computer") {
    statusMessage = "Your turn — choose a square.";
  } else {
    statusMessage = `Player ${nextMark}’s turn.`;
  }

  const currentScore = scores[mode];

  return (
    <main className="page-shell">
      <header className="masthead" aria-label="Tic Tac Toe">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="brand-name">GOOD GAME CLUB</span>
        <span className="brand-note">A classic, made for one more round</span>
      </header>

      <section className="game-card" aria-labelledby="game-title">
        <div className="game-heading">
          <p className="eyebrow">THINK AHEAD. HAVE FUN.</p>
          <h1 id="game-title">Tic Tac Toe</h1>
          <p className="game-intro">A little strategy goes a long way.</p>
        </div>

        <div
          className="mode-picker"
          role="group"
          aria-label="Choose how to play"
        >
          <button
            aria-pressed={mode === "computer"}
            className="mode-button"
            onClick={() => chooseMode("computer")}
            type="button"
          >
            <span className="mode-button-title">Vs. computer</span>
            <span className="mode-button-detail">A solo match</span>
          </button>
          <button
            aria-pressed={mode === "friends"}
            className="mode-button"
            onClick={() => chooseMode("friends")}
            type="button"
          >
            <span className="mode-button-title">Two players</span>
            <span className="mode-button-detail">Pass and play</span>
          </button>
        </div>

        <div className="round-status" aria-atomic="true" aria-live="polite">
          <span
            className={`status-dot${winner || draw ? " status-dot--done" : ""}`}
            aria-hidden="true"
          />
          <p>{statusMessage}</p>
        </div>

        <div className="board-frame">
          <div
            className="game-board"
            role="group"
            aria-label="Tic Tac Toe board"
          >
            {board.map((mark, index) => {
              const isWinningCell = winningLine.includes(index);
              const row = Math.floor(index / 3) + 1;
              const column = (index % 3) + 1;

              return (
                <button
                  aria-label={`Row ${row}, column ${column}, ${mark ?? "empty"}`}
                  className={[
                    "board-cell",
                    mark ? `board-cell--${mark.toLowerCase()}` : "",
                    isWinningCell ? "board-cell--winner" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={
                    Boolean(mark) || Boolean(winner) || draw || computerTurn
                  }
                  key={index}
                  onClick={() => handleCellClick(index)}
                  type="button"
                >
                  {mark && <span aria-hidden="true">{mark}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <section className="scorecard" aria-label="Current visit score">
          <div className="score-item">
            <span className="score-label">
              <span className="score-mark score-mark--x" aria-hidden="true">
                X
              </span>
              {mode === "computer" ? "You" : "Player X"}
            </span>
            <span className="score-value">{currentScore.x}</span>
          </div>
          <div className="score-item score-item--draws">
            <span className="score-label">Draws</span>
            <span className="score-value">{currentScore.draws}</span>
          </div>
          <div className="score-item">
            <span className="score-label">
              <span className="score-mark score-mark--o" aria-hidden="true">
                O
              </span>
              {mode === "computer" ? "Computer" : "Player O"}
            </span>
            <span className="score-value">{currentScore.o}</span>
          </div>
        </section>

        <div className="round-actions">
          <button className="text-button" onClick={resetScore} type="button">
            Reset score
          </button>
          <button
            className="new-round-button"
            onClick={startNewRound}
            type="button"
          >
            <span aria-hidden="true">↻</span>
            New round
          </button>
        </div>
      </section>

      <footer className="page-footer">
        <span>NO ACCOUNTS. NO PRESSURE.</span>
        <span>Just one more round.</span>
      </footer>
    </main>
  );
}
