import { expect, describe, it } from "vitest";
import Backtracking from "../../core/Sudoku/Backtracking";
import samplePuzzles from "../sample/samplePuzzle";
import samplePuzzlesSolution from "../sample/samplePuzzleSolution";

describe("solver", () => {
  it("Backtracking constructor test 1", () => {
    const strClue = [
      ["2", "9", "1", "4", "6", "7", "5", "3", "8"],
      ["7", "4", "3", "8", "9", "5", "1", "6", "2"],
      ["6", "5", "8", "2", "3", "1", "4", "7", "9"],
      ["9", "6", "2", "1", "7", "8", "3", "4", "5"],
      ["8", "1", "5", "9", "4", "3", "7", "2", "6"],
      ["4", "3", "7", "6", "5", "2", "8", "9", "1"],
      ["5", "8", "6", "7", "2", "4", "9", "1", "3"],
      ["1", "7", "9", "3", "8", "6", "2", "5", "4"],
      ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
    ];

    const numClue = [
      [2, 9, 1, 4, 6, 7, 5, 3, 8],
      [7, 4, 3, 8, 9, 5, 1, 6, 2],
      [6, 5, 8, 2, 3, 1, 4, 7, 9],
      [9, 6, 2, 1, 7, 8, 3, 4, 5],
      [8, 1, 5, 9, 4, 3, 7, 2, 6],
      [4, 3, 7, 6, 5, 2, 8, 9, 1],
      [5, 8, 6, 7, 2, 4, 9, 1, 3],
      [1, 7, 9, 3, 8, 6, 2, 5, 4],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const sb = new Backtracking(strClue);
    const nb = new Backtracking(numClue);
    expect(sb.grid).toStrictEqual(nb.grid);
  });

  it("Backtracking takeBack test 1", () => {
    const clue = [
      ["2", "9", "1", "4", "6", "7", "5", "3", "8"],
      ["7", "4", "3", "8", "9", "5", "1", "6", "2"],
      ["6", "5", "8", "2", "3", "1", "4", "7", "9"],
      ["9", "6", "2", "1", "7", "8", "3", "4", "5"],
      ["8", "1", "5", "9", "4", "3", "7", "2", "6"],
      ["4", "3", "7", "6", "5", "2", "8", "9", "1"],
      ["5", "8", "6", "7", "2", "4", "9", "1", "3"],
      ["1", "7", "9", "3", "8", "6", "2", "5", "4"],
      ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
    ];

    const backtracking = new Backtracking(clue);
    backtracking.solveSudoku();
    expect(backtracking.takeBacks).toEqual(0);
  });

  it("Backtracking takeBack test2", () => {
    const clue = [
      ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
      ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
      ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
      ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
      ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
      ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
      ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
      ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
      ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
    ];

    const backtracking = new Backtracking(clue);
    backtracking.solveSudoku();
    expect(backtracking.takeBacks).toBeGreaterThan(0);
  });

  it("Backtracking result", () => {
    for (const key in samplePuzzles) {
      const clue = samplePuzzles[key as keyof typeof samplePuzzles];
      const solution = samplePuzzlesSolution[key as keyof typeof samplePuzzlesSolution];

      const backtracking = new Backtracking(clue);
      backtracking.solveSudoku();
      const strGrid = backtracking.grid.map((row) => row.map((cell) => cell.toString()));
      expect(strGrid).toEqual(solution);
    }
  });
});
