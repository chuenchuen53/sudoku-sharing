import { expect, describe, it } from "vitest";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import Backtracking from "@/Sudoku/Backtracking";
import samplePuzzles from "@/samplePuzzle";
import samplePuzzlesSolution from "@/samplePuzzleSolution";

describe("solver", () => {
  it("SudokuSolver", () => {
    const countTime = new CountTime();

    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const s = new SudokuSolver(clue);
      countTime.add(() => s.trySolve());
      const strGrid = s.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
      expect(strGrid).toEqual(solution);
    }

    console.log(`SudokuSolver: ${countTime.totalTime}ms`);
  });

  it("Backtracking", () => {
    const countTime = new CountTime();

    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const grid = toNumberGrid(clue);
      countTime.add(() => Backtracking.solveSudoku(grid));
      const strGrid = grid.map((row) => row.map((cell) => cell.toString()));
      expect(strGrid).toEqual(solution);
    }

    console.log(`Backtracking: ${countTime.totalTime}ms`);
  });
});

function toNumberGrid(clue: string[][]): number[][] {
  return clue.map((row) => row.map((cell) => parseInt(cell)));
}

class CountTime {
  totalTime: number;

  constructor() {
    this.totalTime = 0;
  }

  add(fn: () => unknown) {
    const start = new Date();
    fn();
    const end = new Date();
    const time = end.getTime() - start.getTime();
    this.totalTime += time;
  }
}
