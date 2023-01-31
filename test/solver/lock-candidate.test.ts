import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import { VirtualLineType } from "../../src/Sudoku/type";
import TU from "../utils";
import type { InputClues, SudokuElement } from "../../src/Sudoku/type";

interface AllResult {
  rowLockInBoxResult: [number, number, SudokuElement][][];
  columnLockInBoxResult: [number, number, SudokuElement][][];
  boxLockInRowResult: [number, number, SudokuElement][][];
  boxLockInColumnResult: [number, number, SudokuElement][][];
}

const allIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8];

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

const p0Result: AllResult = {
  rowLockInBoxResult: [
    [
      [1, 2, "1"],
      [2, 0, "2"],
    ],
    [],
    [
      [1, 4, "1"],
      [1, 5, "1"],
    ],
    [[4, 8, "5"]],
    [],
    [],
    [
      [7, 4, "2"],
      [7, 5, "2"],
      [7, 2, "6"],
    ],
    [],
    [
      [7, 6, "7"],
      [7, 7, "7"],
      [7, 8, "7"],
    ],
  ],
  columnLockInBoxResult: [
    [[1, 2, "6"]],
    [[1, 2, "5"]],
    [
      [0, 0, "3"],
      [2, 0, "3"],
    ],
    [
      [1, 4, "2"],
      [1, 5, "2"],
      [2, 4, "2"],
      [2, 5, "2"],
    ],
    [],
    [
      [1, 4, "1"],
      [2, 4, "1"],
    ],
    [],
    [
      [1, 6, "3"],
      [7, 8, "5"],
      [8, 8, "5"],
      [1, 8, "6"],
    ],
    [],
  ],
  boxLockInRowResult: [
    [],
    [],
    [
      [1, 2, "1"],
      [1, 4, "1"],
      [1, 5, "1"],
      [1, 3, "2"],
      [1, 4, "2"],
      [1, 5, "2"],
    ],
    [[4, 8, "5"]],
    [],
    [],
    [
      [7, 6, "7"],
      [7, 7, "7"],
      [7, 8, "7"],
    ],
    [[7, 2, "6"]],
    [
      [7, 4, "2"],
      [7, 5, "2"],
    ],
  ],
  boxLockInColumnResult: [
    [],
    [],
    [
      [7, 7, "7"],
      [8, 7, "7"],
    ],
    [[1, 2, "5"]],
    [
      [1, 5, "2"],
      [2, 5, "2"],
      [7, 5, "2"],
    ],
    [
      [1, 6, "3"],
      [7, 8, "5"],
      [8, 8, "5"],
      [1, 8, "6"],
    ],
    [
      [0, 0, "3"],
      [2, 0, "3"],
      [1, 2, "6"],
    ],
    [
      [1, 4, "1"],
      [2, 4, "1"],
    ],
    [],
  ],
};

const p1Result: AllResult = {
  rowLockInBoxResult: [
    [[1, 3, "1"]],
    [],
    [
      [0, 3, "5"],
      [0, 4, "5"],
      [0, 5, "5"],
      [1, 3, "5"],
      [1, 3, "8"],
    ],
    [
      [4, 5, "6"],
      [5, 3, "9"],
      [5, 4, "9"],
      [5, 5, "9"],
    ],
    [],
    [],
    [],
    [
      [6, 3, "5"],
      [6, 5, "5"],
    ],
    [
      [6, 3, "1"],
      [6, 5, "1"],
    ],
  ],
  columnLockInBoxResult: [
    [[7, 2, "4"]],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [
      [1, 6, "3"],
      [1, 7, "3"],
      [2, 6, "3"],
      [6, 7, "8"],
    ],
  ],
  boxLockInRowResult: [
    [[1, 3, "8"]],
    [],
    [[1, 3, "1"]],
    [
      [4, 5, "6"],
      [5, 3, "9"],
      [5, 4, "9"],
      [5, 5, "9"],
    ],
    [],
    [],
    [
      [6, 3, "1"],
      [6, 5, "1"],
    ],
    [],
    [
      [6, 3, "5"],
      [6, 5, "5"],
    ],
  ],
  boxLockInColumnResult: [
    [[7, 2, "4"]],
    [],
    [],
    [[1, 2, "6"]],
    [],
    [
      [1, 7, "3"],
      [8, 7, "3"],
      [6, 7, "8"],
    ],
    [],
    [],
    [],
  ],
};

const testFactory = (sudoku: SudokuSolver, allResult: AllResult) => {
  sudoku.setBasicCandidates();

  it("row lock in box candidate", () => {
    for (const index of allIndex) {
      const result = sudoku.rowColumnLockInBox(VirtualLineType.ROW, index);
      const expectedResult = TU.inputValueDataArrFactory(allResult.rowLockInBoxResult[index]);
      expect(result).toStrictEqual(expectedResult);
    }
  });

  it("column lock in box candidate", () => {
    for (const index of allIndex) {
      const result = sudoku.rowColumnLockInBox(VirtualLineType.COLUMN, index);
      const expectedResult = TU.inputValueDataArrFactory(allResult.columnLockInBoxResult[index]);
      expect(result).toStrictEqual(expectedResult);
    }
  });

  it("box lock in row candidate", () => {
    for (const index of allIndex) {
      const result = sudoku.boxLockInRowColumn(VirtualLineType.ROW, index);
      const expectedResult = TU.inputValueDataArrFactory(allResult.boxLockInRowResult[index]);
      expect(result).toStrictEqual(expectedResult);
    }
  });

  it("box lock in column candidate", () => {
    for (const index of allIndex) {
      const result = sudoku.boxLockInRowColumn(VirtualLineType.COLUMN, index);
      const expectedResult = TU.inputValueDataArrFactory(allResult.boxLockInColumnResult[index]);
      expect(result).toStrictEqual(expectedResult);
    }
  });

  it("lock candidate overall", () => {
    const result = sudoku.getRemovalDueToLockedCandidates();

    const rowLockInBoxResultFlat = allResult.rowLockInBoxResult.flat() as [number, number, SudokuElement][];
    const columnLockInBoxResultFlat = allResult.columnLockInBoxResult.flat() as [number, number, SudokuElement][];
    const boxLockInRowResultFlat = allResult.boxLockInRowResult.flat() as [number, number, SudokuElement][];
    const boxLockInColumnResultFlat = allResult.boxLockInColumnResult.flat() as [number, number, SudokuElement][];

    const arr = TU.removeDuplicate2DArray([
      ...rowLockInBoxResultFlat,
      ...columnLockInBoxResultFlat,
      ...boxLockInRowResultFlat,
      ...boxLockInColumnResultFlat,
    ]);

    const expectedResult = TU.inputValueDataArrFactory(arr);
    expect(result).toStrictEqual(expectedResult);
  });

  it("removeCandidatesDueToLockedCandidates", () => {
    const rowLockInBoxResultFlat = allResult.rowLockInBoxResult.flat() as [number, number, SudokuElement][];
    const columnLockInBoxResultFlat = allResult.columnLockInBoxResult.flat() as [number, number, SudokuElement][];
    const boxLockInRowResultFlat = allResult.boxLockInRowResult.flat() as [number, number, SudokuElement][];
    const boxLockInColumnResultFlat = allResult.boxLockInColumnResult.flat() as [number, number, SudokuElement][];

    const arr = TU.removeDuplicate2DArray([
      ...rowLockInBoxResultFlat,
      ...columnLockInBoxResultFlat,
      ...boxLockInRowResultFlat,
      ...boxLockInColumnResultFlat,
    ]);

    expect(sudoku.removeCandidatesDueToLockedCandidates()).toBe(arr.length);
  });
};

describe("sudoku solver lock candidate test suit 1", () => testFactory(new SudokuSolver(p0), p0Result));
describe("sudoku solver lock candidate test suit 2", () => testFactory(new SudokuSolver(p1), p1Result));
