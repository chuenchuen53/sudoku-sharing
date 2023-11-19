import { expect, describe, it } from "vitest";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import samplePuzzles from "../sample/samplePuzzle";
import samplePuzzlesSolution from "../sample/samplePuzzleSolution";
import Sudoku from "../../core/Sudoku/Sudoku";

describe("solver", () => {
  it("sample puzzle test", () => {
    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const s = new SudokuSolver(new Sudoku(clue));
      s.trySolve();
      const strGrid = s.sudoku.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
      expect(strGrid).toEqual(solution);
    }
  });
});
