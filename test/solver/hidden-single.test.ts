import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType } from "../../src/Sudoku/type";
import type { InputClues } from "../../src/Sudoku/type";
import Sudoku from "@/Sudoku/Sudoku";

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

describe("sudoku solver hidden single test", () => {
  it("getHiddenSingleFromVirtualLines test1", () => {
    const line = TestUtil.virtualLineFactory([
      undefined,
      undefined,
      ["5"],
      ["9"],
      ["4", "7", "9"],
      undefined,
      ["7"],
      undefined,
      ["5", "6", "7"],
    ]);
    expect(SudokuSolver.getHiddenSingleFromVirtualLines([line])).toStrictEqual(
      TestUtil.inputValueDataArrFactory([
        [0, 4, "4"],
        [0, 8, "6"],
      ])
    );
  });

  it("getHiddenSingleFromVirtualLines", () => {
    const line = TestUtil.virtualLineFactory([
      ["2", "3"],
      undefined,
      ["2", "3", "6"],
      undefined,
      undefined,
      ["4"],
      undefined,
      undefined,
      ["3"],
    ]);
    expect(SudokuSolver.getHiddenSingleFromVirtualLines([line])).toStrictEqual([
      TestUtil.inputValueDataFactory(0, 2, "6"),
    ]);
  });

  it("getHiddenSingleFromVirtualLines", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const lines = s.sudoku.getAllRows();
    const result = SudokuSolver.getHiddenSingleFromVirtualLines(lines);
    const expectedResult = [
      TestUtil.inputValueDataFactory(0, 2, "1"),
      TestUtil.inputValueDataFactory(0, 0, "2"),
      TestUtil.inputValueDataFactory(1, 1, "4"),
      TestUtil.inputValueDataFactory(2, 7, "7"),
      TestUtil.inputValueDataFactory(3, 6, "3"),
      TestUtil.inputValueDataFactory(3, 8, "5"),
      TestUtil.inputValueDataFactory(4, 4, "4"),
      TestUtil.inputValueDataFactory(4, 8, "6"),
      TestUtil.inputValueDataFactory(7, 8, "4"),
      TestUtil.inputValueDataFactory(7, 2, "9"),
      TestUtil.inputValueDataFactory(8, 4, "1"),
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("getHiddenSingleFromVirtualLines", () => {
    const row0 = TestUtil.virtualLineFactory(
      [
        ["2", "3", "8", "9"],
        ["3", "4", "7"],
        ["2", "3", "4", "7", "8", "9"],
        ["2", "3", "5", "7", "8", "9"],
        ["2", "3", "4", "7", "9"],
        undefined,
        undefined,
        ["2", "7", "8"],
        ["7", "8"],
      ],
      {
        type: VirtualLineType.ROW,
        lineIndex: 0,
      }
    );
    const row1 = TestUtil.virtualLineFactory(
      [
        ["2", "3", "8", "9"],
        ["3", "4", "7"],
        ["2", "3", "4", "7", "8", "9"],
        ["2", "3", "5", "7", "8", "9"],
        ["2", "3", "4", "7", "9"],
        { clue: "1" },
        { clue: "6" },
        ["2", "7", "8"],
        ["7", "8"],
      ],
      {
        type: VirtualLineType.ROW,
        lineIndex: 1,
      }
    );
    const row2 = TestUtil.virtualLineFactory(
      [
        ["2", "3", "8", "9"],
        ["3", "4", "7"],
        ["2", "3", "4", "7", "8", "9"],
        ["2", "3", "5", "7", "8", "9"],
        ["2", "3", "4", "7", "9"],
        { clue: "1" },
        { inputValue: "6" },
        ["2", "7", "8"],
        ["7", "8"],
      ],
      {
        type: VirtualLineType.ROW,
        lineIndex: 2,
      }
    );

    const rows = [row0, row1, row2];

    expect(SudokuSolver.getHiddenSingleFromVirtualLines(rows)).toStrictEqual(
      TestUtil.inputValueDataArrFactory([
        [0, 3, "5"],
        [1, 3, "5"],
        [2, 3, "5"],
      ])
    );
  });

  it("getHiddenSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const result = s.getHiddenSingles();

    const expectedResult = TestUtil.inputValueDataArrFactory([
      // row
      [0, 2, "1"],
      [0, 0, "2"],
      [1, 1, "4"],
      [2, 7, "7"],
      [3, 6, "3"],
      [3, 8, "5"],
      [4, 4, "4"],
      [4, 8, "6"],
      [7, 8, "4"],
      [7, 2, "9"],
      [8, 4, "1"],
      // column
      [2, 0, "6"],
      // [1, 1, "4"], // repeated in row
      // [7, 2, "9"], // repeated in row
      // [4, 4, "4"], // repeated in row
      [7, 5, "6"],
      [1, 6, "1"],
      // [7, 8, "4"], // repeated in row
      // [4, 8, "6"], // repeated in row
      // box
      // [1, 1, "4"], // repeated in row
      // [1, 6, "1"], // repeated in column
      // [2, 7, "7"], // repeated in row
      // [4, 4, "4"], // repeated in column
      // [4, 8, "6"], // repeated in column
      // [7, 2, "9"], // repeated in row
      // [8, 4, "1"], // repeated in row
      // [7, 5, "6"], // repeated in column
      // [7, 8, "4"], // repeated in row
    ]);
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("getHiddenSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    const result = s.getHiddenSingles();

    const expectedResult = TestUtil.inputValueDataArrFactory([
      // row
      [0, 2, "4"],
      [2, 6, "2"],
      [3, 5, "6"],
      [5, 7, "2"],
      [7, 5, "5"],
      [8, 3, "2"],
      // column
      [6, 0, "1"],
      [1, 1, "8"],
      // [8, 3, "2"], // repeated in row
      [1, 6, "1"],
      // [2, 6, "2"], // repeated in row
      // [5, 7, "2"], // repeated in row
      [6, 8, "8"],
      // box
      // [0, 2, "4"], // repeated in row
      // [1, 1, "8"], // repeated in column
      // [1, 6, "1"], // repeated in column
      // [2, 6, "2"], // repeated in row
      [4, 2, "6"],
      // [3, 5, "6"], // repeated in row
      // [5, 7, "2"], // repeated in row
      // [6, 0, "1"], // repeated in column
      // [8, 3, "2"], // repeated in row
      // [7, 5, "5"], // repeated in row
    ]);
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("setHiddenSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    expect(s.setHiddenSingles()).toBe(14);
  });

  it("setHiddenSingles test 2", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    expect(s.setHiddenSingles()).toBe(11);
  });
});
