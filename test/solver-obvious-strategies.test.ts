import { expect, describe, it } from "vitest";
import { candidatesFactory } from "../src/Sudoku";
import SudokuSolver, { UniqueMissing } from "../src/Sudoku/SudokuSolver";
import { InputClues, VirtualLineType, SudokuElement, VirtualLine } from "../src/Sudoku/type";
import TU from "./utils";

// easy
export const testPuzzle0: InputClues = [
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

describe("sudoku solver", () => {
  it("numberOfCandidates", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);
    expect(SudokuSolver.numberOfCandidates(c1)).toBe(1);
    expect(SudokuSolver.numberOfCandidates(c2)).toBe(2);
    expect(SudokuSolver.numberOfCandidates(c3)).toBe(6);
  });

  it("getUniqueCandidate", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);
    expect(SudokuSolver.getUniqueCandidate(c1)).toBe("1");
    expect(SudokuSolver.getUniqueCandidate(c2)).toBeNull();
    expect(SudokuSolver.getUniqueCandidate(c3)).toBeNull();
  });

  it("getUniqueMissing", () => {
    const cf = (r: number, c: number) => ({ rowIndex: r, columnIndex: c });
    const fn: (vl: VirtualLine, e: SudokuElement, r: number, c: number) => UniqueMissing = (vl, e, r, c) => ({
      virtualLine: vl,
      uniqueCandidate: e,
      cell: cf(r, c),
    });

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
    expect(s.getUniqueMissing(VirtualLineType.ROW)).toStrictEqual([fn(s.getRow(0), "1", 0, 2)]);
    expect(s.getUniqueMissing(VirtualLineType.COLUMN)).toStrictEqual([fn(s.getColumn(0), "3", 8, 0)]);
    expect(s.getUniqueMissing(VirtualLineType.BOX)).toStrictEqual([fn(s.getBoxFromBoxIndex(3), "5", 4, 2)]);
  });

  it("getNakedSingles", () => {
    const s = new SudokuSolver(testPuzzle0);
    s.getBasicCandidates();
    const nakedSingles = s.getNakedSingles();
    expect(nakedSingles).toStrictEqual([
      TU.inputValueDataFactory(0, 7, "3"),
      TU.inputValueDataFactory(2, 1, "5"),
      TU.inputValueDataFactory(3, 5, "8"),
      TU.inputValueDataFactory(4, 2, "5"),
      TU.inputValueDataFactory(4, 3, "9"),
      TU.inputValueDataFactory(4, 6, "7"),
      TU.inputValueDataFactory(5, 0, "4"),
      TU.inputValueDataFactory(5, 5, "2"),
      TU.inputValueDataFactory(5, 7, "9"),
      TU.inputValueDataFactory(6, 2, "6"),
      TU.inputValueDataFactory(6, 4, "2"),
      TU.inputValueDataFactory(7, 1, "7"),
      TU.inputValueDataFactory(8, 0, "3"),
    ]);
  });

  it("getHiddenSingleFromVirtualLine", () => {
    const line = TU.candidatesLineFactory([
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
    expect(SudokuSolver.getHiddenSingleFromVirtualLine(line)).toStrictEqual([
      TU.inputValueDataFactory(0, 4, "4"),
      TU.inputValueDataFactory(0, 8, "6"),
    ]);
  });

  it("getHiddenSingleFromVirtualLine", () => {
    const line = TU.candidatesLineFactory([
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
    expect(SudokuSolver.getHiddenSingleFromVirtualLine(line)).toStrictEqual([TU.inputValueDataFactory(0, 2, "6")]);
  });

  it("getHiddenSingleFromVirtualLines", () => {
    const s = new SudokuSolver(testPuzzle0);
    s.getBasicCandidates();
    const lines = s.getAllRows();
    const result = SudokuSolver.getHiddenSingleFromVirtualLines(lines);
    console.log("file: solver.test.ts ~ line 178 ~ it ~ result", result);
    const expectedResult = [
      TU.inputValueDataFactory(0, 2, "1"),
      TU.inputValueDataFactory(0, 0, "2"),
      TU.inputValueDataFactory(1, 1, "4"),
      TU.inputValueDataFactory(2, 7, "7"),
      TU.inputValueDataFactory(3, 6, "3"),
      TU.inputValueDataFactory(3, 8, "5"),
      TU.inputValueDataFactory(4, 4, "4"),
      TU.inputValueDataFactory(4, 8, "6"),
      TU.inputValueDataFactory(7, 8, "4"),
      TU.inputValueDataFactory(7, 2, "9"),
      TU.inputValueDataFactory(8, 4, "1"),
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("getHiddenSingles", () => {
    const s = new SudokuSolver(testPuzzle0);
    s.getBasicCandidates();
    const result = s.getHiddenSingles();
    const expectedResult = [
      // row
      TU.inputValueDataFactory(0, 2, "1"),
      TU.inputValueDataFactory(0, 0, "2"),
      TU.inputValueDataFactory(1, 1, "4"),
      TU.inputValueDataFactory(2, 7, "7"),
      TU.inputValueDataFactory(3, 6, "3"),
      TU.inputValueDataFactory(3, 8, "5"),
      TU.inputValueDataFactory(4, 4, "4"),
      TU.inputValueDataFactory(4, 8, "6"),
      TU.inputValueDataFactory(7, 8, "4"),
      TU.inputValueDataFactory(7, 2, "9"),
      TU.inputValueDataFactory(8, 4, "1"),
      // column
      TU.inputValueDataFactory(2, 0, "6"),
      // TU.inputValueDataFactory(1, 1, "4"), // repeated in row
      // TU.inputValueDataFactory(7, 2, "9"), // repeated in row
      // TU.inputValueDataFactory(4, 4, "4"), // repeated in row
      TU.inputValueDataFactory(7, 5, "6"),
      TU.inputValueDataFactory(1, 6, "1"),
      // TU.inputValueDataFactory(7, 8, "4"), // repeated in row
      // TU.inputValueDataFactory(4, 8, "6"), // repeated in row
      // box
      // TU.inputValueDataFactory(1, 1, "4"), // repeated in row
      // TU.inputValueDataFactory(1, 6, "1"), // repeated in column
      // TU.inputValueDataFactory(2, 7, "7"), // repeated in row
      // TU.inputValueDataFactory(4, 4, "4"), // repeated in column
      // TU.inputValueDataFactory(4, 8, "6"), // repeated in column
      // TU.inputValueDataFactory(7, 2, "9"), // repeated in row
      // TU.inputValueDataFactory(8, 4, "1"), // repeated in row
      // TU.inputValueDataFactory(7, 5, "6"), // repeated in column
      // TU.inputValueDataFactory(7, 8, "4"), // repeated in row
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });
});
