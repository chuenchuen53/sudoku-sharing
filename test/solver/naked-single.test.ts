import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import type { InputClues } from "../../src/Sudoku/type";
import Sudoku from "../../src/Sudoku/Sudoku";
import NakedSingle from "../../src/Sudoku/FillStrategy/NakedSingle";
import { FillStrategyType } from "../../src/Sudoku/FillStrategy/FillStrategy";

const p0: InputClues = [
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

const p1: InputClues = [
  ["2", "0", "0", "0", "0", "0", "8", "6", "0"],
  ["0", "0", "0", "0", "4", "2", "0", "0", "0"],
  ["0", "1", "0", "0", "6", "0", "0", "4", "7"],
  ["3", "4", "5", "0", "2", "0", "0", "0", "1"],
  ["7", "2", "0", "0", "0", "0", "4", "0", "9"],
  ["8", "0", "0", "0", "0", "0", "5", "0", "6"],
  ["0", "0", "2", "0", "3", "0", "0", "0", "0"],
  ["0", "0", "0", "6", "8", "0", "0", "1", "2"],
  ["5", "0", "8", "0", "0", "0", "0", "0", "4"],
];

describe("sudoku solver naked single test", () => {
  it("nakedSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const fillNakedSingle = NakedSingle.getInstance();
    const nakedSingles = fillNakedSingle.canFill(s.sudoku);
    expect(nakedSingles).toStrictEqual(
      TestUtil.inputValueDataArrFactory([
        [0, 7, "3"],
        [2, 1, "5"],
        [3, 5, "8"],
        [4, 2, "5"],
        [4, 3, "9"],
        [4, 6, "7"],
        [5, 0, "4"],
        [5, 5, "2"],
        [5, 7, "9"],
        [6, 2, "6"],
        [6, 4, "2"],
        [7, 1, "7"],
        [8, 0, "3"],
      ]),
    );
  });

  it("getNakedSingles test 2", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    const fillNakedSingle = NakedSingle.getInstance();
    const nakedSingles = fillNakedSingle.canFill(s.sudoku);
    expect(nakedSingles).toStrictEqual(
      TestUtil.inputValueDataArrFactory([
        [2, 0, "9"],
        [3, 6, "7"],
        [5, 1, "9"],
      ]),
    );
  });

  it("setNakedSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    expect(s.setValueFromFillStrategy(FillStrategyType.NAKED_SINGLE)).toBe(13);
  });

  it("setNakedSingles test 2", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    expect(s.setValueFromFillStrategy(FillStrategyType.NAKED_SINGLE)).toBe(3);
  });
});
