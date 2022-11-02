import { expect, describe, it, vitest, beforeAll } from "vitest";
import ArrayUtils from "../src/utils/ArrayUtil";
import Sudoku, { CheckVirtualLineDuplicateResult, candidatesFactory } from "../src/Sudoku";
import SudokuSolver, { UniqueMissing } from "../src/Sudoku/SudokuSolver";
import {
  Candidates,
  CellWithIndex,
  InputClues,
  VirtualLineType,
  SudokuElement,
  InputValueData,
  VirtualLine,
  SudokuElementWithZero,
} from "../src/Sudoku/type";
import exp from "constants";

const inputValueDataFactory = (r: number, c: number, v: SudokuElement): InputValueData => {
  return {
    rowIndex: r,
    columnIndex: c,
    value: v,
  };
};

// const virtualLineFactory = (
//   clue: SudokuElementWithZero[],
//   inputValue: SudokuElementWithZero[],
//   candidates: (Candidates | undefined)[]
// ): VirtualLine => {
//   return ArrayUtils.zip3(clue, inputValue, candidates).map((element, index) => {
//     const [clue, inputValue, candidates] = element;
//     return {
//       clue: clue === "0" ? undefined : clue,
//       inputValue: clue !== "0" || inputValue === "0" ? undefined : inputValue,
//       candidates: clue !== "0" || inputValue !== "0" ? undefined : candidates,
//       rowIndex: 0,
//       columnIndex: index,
//     };
//   });
// };

const candidatesLineFactory = (candidates: (SudokuElement[] | undefined)[]): VirtualLine => {
  return candidates.map((candidates, index) => {
    return {
      candidates: candidates ? candidatesFactory(true, candidates) : undefined,
      rowIndex: 0,
      columnIndex: index,
    };
  });
};

// easy
export const testingPuzzle0: InputClues = [
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

const testPuzzle1: InputClues = [
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
    const fn: (vl: VirtualLine, e: SudokuElement) => UniqueMissing = (vl, e) => ({
      virtualLine: vl,
      uniqueCandidate: e,
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
    expect(s.getUniqueMissing(VirtualLineType.ROW)).toStrictEqual([fn(s.getRow(0), "1")]);
    expect(s.getUniqueMissing(VirtualLineType.COLUMN)).toStrictEqual([fn(s.getColumn(0), "3")]);
    expect(s.getUniqueMissing(VirtualLineType.BOX)).toStrictEqual([fn(s.getBoxFromBoxIndex(3), "5")]);
  });

  it("getNakedSingles", () => {
    const s = new SudokuSolver(testingPuzzle0);
    s.getBasicCandidates();
    const nakedSingles = s.getNakedSingles();
    expect(nakedSingles).toStrictEqual([
      inputValueDataFactory(0, 7, "3"),
      inputValueDataFactory(2, 1, "5"),
      inputValueDataFactory(3, 5, "8"),
      inputValueDataFactory(4, 2, "5"),
      inputValueDataFactory(4, 3, "9"),
      inputValueDataFactory(4, 6, "7"),
      inputValueDataFactory(5, 0, "4"),
      inputValueDataFactory(5, 5, "2"),
      inputValueDataFactory(5, 7, "9"),
      inputValueDataFactory(6, 2, "6"),
      inputValueDataFactory(6, 4, "2"),
      inputValueDataFactory(7, 1, "7"),
      inputValueDataFactory(8, 0, "3"),
    ]);
  });

  it("getHiddenSingleFromVirtualLine", () => {
    const line = candidatesLineFactory([
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
      inputValueDataFactory(0, 4, "4"),
      inputValueDataFactory(0, 8, "6"),
    ]);
  });

  it("getHiddenSingleFromVirtualLine", () => {
    const line = candidatesLineFactory([
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
    expect(SudokuSolver.getHiddenSingleFromVirtualLine(line)).toStrictEqual([inputValueDataFactory(0, 2, "6")]);
  });

  it("getHiddenSingleFromVirtualLines", () => {
    const s = new SudokuSolver(testingPuzzle0);
    s.getBasicCandidates();
    const lines = s.getAllRows();
    const result = SudokuSolver.getHiddenSingleFromVirtualLines(lines);
    console.log("file: solver.test.ts ~ line 178 ~ it ~ result", result);
    const expectedResult = [
      inputValueDataFactory(0, 2, "1"),
      inputValueDataFactory(0, 0, "2"),
      inputValueDataFactory(1, 1, "4"),
      inputValueDataFactory(2, 7, "7"),
      inputValueDataFactory(3, 6, "3"),
      inputValueDataFactory(3, 8, "5"),
      inputValueDataFactory(4, 4, "4"),
      inputValueDataFactory(4, 8, "6"),
      inputValueDataFactory(7, 8, "4"),
      inputValueDataFactory(7, 2, "9"),
      inputValueDataFactory(8, 4, "1"),
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });

  it("getHiddenSingles", () => {
    const s = new SudokuSolver(testingPuzzle0);
    s.getBasicCandidates();
    const result = s.getHiddenSingles();
    const expectedResult = [
      // row
      inputValueDataFactory(0, 2, "1"),
      inputValueDataFactory(0, 0, "2"),
      inputValueDataFactory(1, 1, "4"),
      inputValueDataFactory(2, 7, "7"),
      inputValueDataFactory(3, 6, "3"),
      inputValueDataFactory(3, 8, "5"),
      inputValueDataFactory(4, 4, "4"),
      inputValueDataFactory(4, 8, "6"),
      inputValueDataFactory(7, 8, "4"),
      inputValueDataFactory(7, 2, "9"),
      inputValueDataFactory(8, 4, "1"),
      // column
      inputValueDataFactory(2, 0, "6"),
      // inputValueDataFactory(1, 1, "4"), // repeated in row
      // inputValueDataFactory(7, 2, "9"), // repeated in row
      // inputValueDataFactory(4, 4, "4"), // repeated in row
      inputValueDataFactory(7, 5, "6"),
      inputValueDataFactory(1, 6, "1"),
      // inputValueDataFactory(7, 8, "4"), // repeated in row
      // inputValueDataFactory(4, 8, "6"), // repeated in row
      // box
      // inputValueDataFactory(1, 1, "4"), // repeated in row
      // inputValueDataFactory(1, 6, "1"), // repeated in column
      // inputValueDataFactory(2, 7, "7"), // repeated in row
      // inputValueDataFactory(4, 4, "4"), // repeated in column
      // inputValueDataFactory(4, 8, "6"), // repeated in column
      // inputValueDataFactory(7, 2, "9"), // repeated in row
      // inputValueDataFactory(8, 4, "1"), // repeated in row
      // inputValueDataFactory(7, 5, "6"), // repeated in column
      // inputValueDataFactory(7, 8, "4"), // repeated in row
    ];
    expectedResult.forEach((e) => expect(result).toContainEqual(e));
    expect(result).toStrictEqual(expectedResult);
  });
});
