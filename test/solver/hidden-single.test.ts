import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType } from "../../src/Sudoku/type";
import type { InputClues } from "../../src/Sudoku/type";
import Sudoku from "@/Sudoku/Sudoku";
import FillHiddenSingle from "@/Sudoku/FillStrategy/FillHiddenSingle";

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
  it("hiddenSingleFromVirtualLines test1", () => {
    const line = TestUtil.virtualLineFactory([undefined, undefined, ["5"], ["9"], ["4", "7", "9"], undefined, ["7"], undefined, ["5", "6", "7"]]);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines([line], VirtualLineType.ROW)).toStrictEqual(
      TestUtil.fillInputValueDataArrFactory([
        [0, 4, "4", VirtualLineType.ROW, 0],
        [0, 8, "6", VirtualLineType.ROW, 0],
      ])
    );
  });

  it("hiddenSingleFromVirtualLines test2", () => {
    const line = TestUtil.virtualLineFactory([["2", "3"], undefined, ["2", "3", "6"], undefined, undefined, ["4"], undefined, undefined, ["3"]]);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines([line], VirtualLineType.ROW)).toStrictEqual(
      TestUtil.fillInputValueDataArrFactory([[0, 2, "6", VirtualLineType.ROW, 0]])
    );
  });

  it("getHiddenSingleFromVirtualLines test3", () => {
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

    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(rows, VirtualLineType.ROW)).toStrictEqual(
      TestUtil.fillInputValueDataArrFactory([
        [0, 3, "5", VirtualLineType.ROW, 0],
        [1, 3, "5", VirtualLineType.ROW, 1],
        [2, 3, "5", VirtualLineType.ROW, 2],
      ])
    );
  });

  it("hiddenSingleFromVirtualLines test4", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const result = FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllRows(), VirtualLineType.ROW);
    const expectedResult = [
      TestUtil.fillInputValueDataFactory(0, 2, "1", VirtualLineType.ROW, 0),
      TestUtil.fillInputValueDataFactory(0, 0, "2", VirtualLineType.ROW, 0),
      TestUtil.fillInputValueDataFactory(1, 1, "4", VirtualLineType.ROW, 1),
      TestUtil.fillInputValueDataFactory(2, 7, "7", VirtualLineType.ROW, 2),
      TestUtil.fillInputValueDataFactory(3, 6, "3", VirtualLineType.ROW, 3),
      TestUtil.fillInputValueDataFactory(3, 8, "5", VirtualLineType.ROW, 3),
      TestUtil.fillInputValueDataFactory(4, 4, "4", VirtualLineType.ROW, 4),
      TestUtil.fillInputValueDataFactory(4, 8, "6", VirtualLineType.ROW, 4),
      TestUtil.fillInputValueDataFactory(7, 8, "4", VirtualLineType.ROW, 7),
      TestUtil.fillInputValueDataFactory(7, 2, "9", VirtualLineType.ROW, 7),
      TestUtil.fillInputValueDataFactory(8, 4, "1", VirtualLineType.ROW, 8),
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("getHiddenSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const fillHiddenSingle = new FillHiddenSingle();
    const overallResult = fillHiddenSingle.canFill(s.sudoku);

    const expectedRowResult = TestUtil.fillInputValueDataArrFactory([
      [0, 2, "1", VirtualLineType.ROW, 0],
      [0, 0, "2", VirtualLineType.ROW, 0],
      [1, 1, "4", VirtualLineType.ROW, 1],
      [2, 7, "7", VirtualLineType.ROW, 2],
      [3, 6, "3", VirtualLineType.ROW, 3],
      [3, 8, "5", VirtualLineType.ROW, 3],
      [4, 4, "4", VirtualLineType.ROW, 4],
      [4, 8, "6", VirtualLineType.ROW, 4],
      [7, 8, "4", VirtualLineType.ROW, 7],
      [7, 2, "9", VirtualLineType.ROW, 7],
      [8, 4, "1", VirtualLineType.ROW, 8],
    ]);
    const expectedColumnResult = TestUtil.fillInputValueDataArrFactory([
      [2, 0, "6", VirtualLineType.COLUMN, 0],
      [1, 1, "4", VirtualLineType.COLUMN, 1], // repeated in row
      [7, 2, "9", VirtualLineType.COLUMN, 2], // repeated in row
      [4, 4, "4", VirtualLineType.COLUMN, 4], // repeated in row
      [7, 5, "6", VirtualLineType.COLUMN, 5],
      [1, 6, "1", VirtualLineType.COLUMN, 6],
      [7, 8, "4", VirtualLineType.COLUMN, 8], // repeated in row
    ]);
    const expectedBoxResult = TestUtil.fillInputValueDataArrFactory([
      [1, 1, "4", VirtualLineType.BOX, 0], // repeated in row
      [1, 6, "1", VirtualLineType.BOX, 2], // repeated in column
      [2, 7, "7", VirtualLineType.BOX, 2], // repeated in row
      [4, 4, "4", VirtualLineType.BOX, 4], // repeated in column
      [3, 6, "3", VirtualLineType.BOX, 5], // repeated in row
      [4, 8, "6", VirtualLineType.BOX, 5], // repeated in column
      [7, 2, "9", VirtualLineType.BOX, 6], // repeated in row
      [8, 4, "1", VirtualLineType.BOX, 7], // repeated in row
      [7, 5, "6", VirtualLineType.BOX, 7], // repeated in column
      [7, 8, "4", VirtualLineType.BOX, 8], // repeated in row
    ]);
    const expectedOverallResult = TestUtil.fillInputValueDataArrFactory([
      [0, 2, "1", VirtualLineType.ROW, 0],
      [0, 0, "2", VirtualLineType.ROW, 0],
      [1, 1, "4", VirtualLineType.ROW, 1],
      [2, 7, "7", VirtualLineType.ROW, 2],
      [3, 6, "3", VirtualLineType.ROW, 3],
      [3, 8, "5", VirtualLineType.ROW, 3],
      [4, 4, "4", VirtualLineType.ROW, 4],
      [4, 8, "6", VirtualLineType.ROW, 4],
      [7, 8, "4", VirtualLineType.ROW, 7],
      [7, 2, "9", VirtualLineType.ROW, 7],
      [8, 4, "1", VirtualLineType.ROW, 8],
      [2, 0, "6", VirtualLineType.COLUMN, 0],
      [7, 5, "6", VirtualLineType.COLUMN, 5],
      [1, 6, "1", VirtualLineType.COLUMN, 6],
    ]);

    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllRows(), VirtualLineType.ROW)).toStrictEqual(expectedRowResult);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllColumns(), VirtualLineType.COLUMN)).toStrictEqual(expectedColumnResult);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllBoxes(), VirtualLineType.BOX)).toStrictEqual(expectedBoxResult);

    expectedOverallResult.forEach((e) => expect(overallResult).toContainEqual(e));
    expect(overallResult).toStrictEqual(expectedOverallResult);
  });

  it("getHiddenSingles test 1", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    const fillHiddenSingle = new FillHiddenSingle();
    const overallResult = fillHiddenSingle.canFill(s.sudoku);

    const expectedRowResult = TestUtil.fillInputValueDataArrFactory([
      [0, 2, "4", VirtualLineType.ROW, 0],
      [2, 6, "2", VirtualLineType.ROW, 2],
      [3, 5, "6", VirtualLineType.ROW, 3],
      [5, 7, "2", VirtualLineType.ROW, 5],
      [7, 5, "5", VirtualLineType.ROW, 7],
      [8, 3, "2", VirtualLineType.ROW, 8],
    ]);
    const expectedColumnResult = TestUtil.fillInputValueDataArrFactory([
      [6, 0, "1", VirtualLineType.COLUMN, 0],
      [1, 1, "8", VirtualLineType.COLUMN, 1],
      [8, 3, "2", VirtualLineType.COLUMN, 3], // repeated in row
      [1, 6, "1", VirtualLineType.COLUMN, 6],
      [2, 6, "2", VirtualLineType.COLUMN, 6], // repeated in row
      [5, 7, "2", VirtualLineType.COLUMN, 7], // repeated in row
      [6, 8, "8", VirtualLineType.COLUMN, 8],
    ]);
    const expectedBoxResult = TestUtil.fillInputValueDataArrFactory([
      [0, 2, "4", VirtualLineType.BOX, 0], // repeated in row
      [1, 1, "8", VirtualLineType.BOX, 0], // repeated in column
      [1, 6, "1", VirtualLineType.BOX, 2], // repeated in column
      [2, 6, "2", VirtualLineType.BOX, 2], // repeated in row
      [4, 2, "6", VirtualLineType.BOX, 3],
      [5, 7, "2", VirtualLineType.BOX, 5], // repeated in row
      [6, 0, "1", VirtualLineType.BOX, 6], // repeated in column
      [8, 3, "2", VirtualLineType.BOX, 7], // repeated in row
    ]);

    const expectedResult = TestUtil.fillInputValueDataArrFactory([
      [0, 2, "4", VirtualLineType.ROW, 0],
      [2, 6, "2", VirtualLineType.ROW, 2],
      [3, 5, "6", VirtualLineType.ROW, 3],
      [5, 7, "2", VirtualLineType.ROW, 5],
      [7, 5, "5", VirtualLineType.ROW, 7],
      [8, 3, "2", VirtualLineType.ROW, 8],
      [6, 0, "1", VirtualLineType.COLUMN, 0],
      [1, 1, "8", VirtualLineType.COLUMN, 1],
      [1, 6, "1", VirtualLineType.COLUMN, 6],
      [6, 8, "8", VirtualLineType.COLUMN, 8],
      [4, 2, "6", VirtualLineType.BOX, 3],
    ]);

    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllRows(), VirtualLineType.ROW)).toStrictEqual(expectedRowResult);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllColumns(), VirtualLineType.COLUMN)).toStrictEqual(expectedColumnResult);
    expect(FillHiddenSingle.hiddenSingleFromVirtualLines(s.sudoku.getAllBoxes(), VirtualLineType.BOX)).toStrictEqual(expectedBoxResult);
    expectedResult.forEach((e) => expect(overallResult).toContainEqual(e));
    expect(overallResult).toStrictEqual(expectedResult);
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
