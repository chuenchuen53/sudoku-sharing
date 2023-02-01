import { expect, describe, it } from "vitest";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import Backtracking from "@/Sudoku/Backtracking";
import samplePuzzles from "@/samplePuzzle";
import samplePuzzlesSolution from "@/samplePuzzleSolution";

describe("solver", () => {
  it("SudokuSolver", () => {
    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const s = new SudokuSolver(clue);
      s.trySolve();
      const strGrid = s.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
      expect(strGrid).toEqual(solution);
    }
  });

  it("Backtracking", () => {
    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const grid = toNumberGrid(clue);
      Backtracking.solveSudoku(grid);
      const strGrid = grid.map((row) => row.map((cell) => cell.toString()));
      expect(strGrid).toEqual(solution);
    }
  });
});

function toNumberGrid(clue: string[][]): number[][] {
  return clue.map((row) => row.map((cell) => parseInt(cell)));
}
