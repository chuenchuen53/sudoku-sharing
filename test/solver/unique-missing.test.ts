import { expect, describe, it } from "vitest";
import TU from "test/utils";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import type { InputClues, SudokuElement, VirtualLine, UniqueMissingResult } from "../../src/Sudoku/type";

const rcf = (r: number, c: number) => ({ rowIndex: r, columnIndex: c });
const urf: (vl: VirtualLine, e: SudokuElement, r: number, c: number) => UniqueMissingResult = (vl, e, r, c) => ({
  virtualLine: vl,
  uniqueCandidate: e,
  cell: rcf(r, c),
});

describe("sudoku solver unique missing test", () => {
  it("getUniqueMissingFromVirtualLines test 1", () => {
    const line0 = TU.virtualLineFactory([
      { clue: "1" },
      { clue: "2" },
      { clue: "3" },
      { clue: "4" },
      { clue: "5" },
      { clue: "6" },
      { clue: "7" },
      { clue: "8" },
      { clue: "9" },
    ]);
    const line1 = TU.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "3" },
      { clue: "4" },
      { clue: "5" },
      { clue: "6" },
      { clue: "7" },
      { clue: "8" },
      { clue: "9" },
    ]);
    const line2 = TU.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "3" },
      { inputValue: "4" },
      { clue: "5" },
      { clue: "6" },
      { inputValue: "7" },
      { inputValue: "8" },
      { clue: "9" },
    ]);
    const line3 = TU.virtualLineFactory([
      { clue: "1" },
      ["2"],
      { clue: "3" },
      { inputValue: "4" },
      { clue: "5" },
      { clue: "6" },
      { inputValue: "7" },
      { inputValue: "8" },
      { clue: "9" },
    ]);
    const line4 = TU.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
    ]);

    const lines = [line0, line1, line2, line3, line4];

    const expectedResult: UniqueMissingResult[] = [
      {
        virtualLine: line1,
        uniqueCandidate: "2",
        cell: line1[1],
      },
      {
        virtualLine: line2,
        uniqueCandidate: "2",
        cell: line2[1],
      },
      {
        virtualLine: line3,
        uniqueCandidate: "2",
        cell: line3[1],
      },
    ];

    expect(SudokuSolver.getUniqueMissingFromVirtualLines(lines)).toStrictEqual(expectedResult);
  });

  it("getUniqueMissingFromVirtualLines test 2", () => {
    const fn = SudokuSolver.getUniqueMissingFromVirtualLines;

    const clue: InputClues = [
      ["2", "9", "0", "4", "6", "7", "5", "3", "8"],
      ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
      ["6", "0", "8", "0", "0", "0", "4", "0", "9"],
      ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
      ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
      ["4", "3", "7", "6", "5", "0", "8", "0", "1"],
      ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
      ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
      ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
    ];
    const s = new SudokuSolver(clue);
    expect(fn(s.getAllRows())).toStrictEqual([urf(s.getRow(0), "1", 0, 2)]);
    expect(fn(s.getAllColumns())).toStrictEqual([urf(s.getColumn(0), "3", 8, 0)]);
    expect(fn(s.getAllBoxes())).toStrictEqual([urf(s.getBoxFromBoxIndex(3), "5", 4, 2)]);
  });

  it("getUniqueMissingFromVirtualLines test 3", () => {
    const fn = SudokuSolver.getUniqueMissingFromVirtualLines;

    const clue: InputClues = [
      ["2", "9", "1", "4", "6", "7", "5", "3", "8"],
      ["7", "4", "3", "8", "9", "5", "1", "6", "2"],
      ["6", "5", "8", "2", "3", "1", "4", "7", "9"],
      ["9", "6", "2", "1", "7", "8", "3", "4", "5"],
      ["8", "1", "5", "9", "4", "3", "7", "2", "6"],
      ["4", "3", "7", "6", "5", "2", "8", "9", "1"],
      ["5", "8", "6", "7", "2", "4", "9", "1", "3"],
      ["1", "7", "9", "3", "8", "6", "2", "5", "4"],
      ["3", "2", "4", "5", "1", "9", "6", "8", "0"],
    ];

    const s = new SudokuSolver(clue);
    expect(fn(s.getAllRows())).toStrictEqual([urf(s.getRow(8), "7", 8, 8)]);
    expect(fn(s.getAllColumns())).toStrictEqual([urf(s.getColumn(8), "7", 8, 8)]);
    expect(fn(s.getAllBoxes())).toStrictEqual([urf(s.getBoxFromBoxIndex(8), "7", 8, 8)]);

    // check remove duplicated
    expect(s.getUniqueMissing()).toStrictEqual([urf(s.getRow(8), "7", 8, 8)]);

    expect(s.setUniqueMissing()).toBe(true);
    expect(s.isValid).toBe(true);
    expect(s.solved).toBe(true);
    expect(s.setUniqueMissing()).toBe(false);
  });
});
