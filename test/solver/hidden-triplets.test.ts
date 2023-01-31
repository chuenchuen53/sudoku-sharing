import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TU from "../utils";
import type { InputClues, InputValueData, HiddenMultipleFromVirtualLinesResult } from "../../src/Sudoku/type";

const p3: InputClues = [
  ["0", "0", "0", "0", "0", "1", "6", "0", "0"],
  ["0", "0", "5", "0", "0", "0", "0", "0", "3"],
  ["0", "0", "0", "0", "0", "0", "5", "9", "4"],
  ["0", "8", "0", "0", "6", "0", "0", "0", "1"],
  ["0", "1", "0", "0", "0", "4", "9", "0", "2"],
  ["4", "9", "0", "1", "8", "0", "0", "0", "0"],
  ["0", "2", "0", "4", "0", "6", "1", "0", "0"],
  ["0", "0", "0", "0", "5", "3", "2", "0", "0"],
  ["7", "0", "0", "0", "0", "8", "0", "6", "0"],
];

const p4: InputClues = [
  ["0", "0", "0", "0", "0", "0", "0", "6", "0"],
  ["0", "0", "0", "3", "8", "0", "1", "9", "0"],
  ["0", "0", "7", "5", "0", "0", "3", "4", "2"],
  ["8", "9", "0", "0", "0", "0", "4", "0", "0"],
  ["0", "0", "6", "0", "0", "0", "8", "0", "1"],
  ["3", "4", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "4", "6", "7", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "5", "0", "3", "0"],
  ["0", "7", "0", "0", "0", "1", "0", "0", "0"],
];

describe("sudoku solver", () => {
  it("getHiddenMultipleFromVirtualLines sizeOfCandidate=3", () => {
    const line = TU.virtualLineFactory([
      ["1", "2", "8", "9"],
      undefined,
      ["1", "2", "3", "4", "9"],
      ["3", "4", "7", "8", "9"],
      undefined,
      ["3", "4"],
      ["1", "2", "3", "4", "5", "6", "7"],
      undefined,
      ["5", "6", "7", "8"],
    ]);

    const result = SudokuSolver.getHiddenMultipleFromVirtualLines([line], 3);
    const expectResult: HiddenMultipleFromVirtualLinesResult[] = [
      {
        combination: ["5", "6", "7"],
        multiple: [line[3], line[6], line[8]],
        elimination: TU.inputValueDataArrFactory([
          [0, 3, "3"],
          [0, 3, "4"],
          [0, 3, "8"],
          [0, 3, "9"],
          [0, 6, "1"],
          [0, 6, "2"],
          [0, 6, "3"],
          [0, 6, "4"],
          [0, 8, "8"],
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(p3);
    s.setBasicCandidates();
    const result = s.getRemovalDueToHiddenTriplets();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [0, 3, "2"], // due to [5, 6, 8] in box 1
      [0, 3, "3"], // due to [5, 6, 8] in box 1
      [0, 3, "7"], // due to [5, 6, 8] in box 1
      [0, 3, "9"], // due to [5, 6, 8] in box 1
      [1, 3, "2"], // due to [5, 6, 8] in box 1
      [1, 3, "7"], // due to [5, 6, 8] in box 1
      [1, 3, "9"], // due to [5, 6, 8] in box 1
      [2, 3, "2"], // due to [5, 6, 8] in box 1
      [2, 3, "3"], // due to [5, 6, 8] in box 1
      [2, 3, "7"], // due to [5, 6, 8] in box 1
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(p4);
    s.setBasicCandidates();
    const result = s.getRemovalDueToHiddenTriplets();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [4, 3, "2"], // due to [3, 4, 9] in row 4
      [4, 3, "7"], // due to [3, 4, 9] in row 4
      [4, 4, "2"], // due to [3, 4, 9] in row 4
      [4, 4, "5"], // due to [3, 4, 9] in row 4
      [4, 4, "7"], // due to [3, 4, 9] in row 4
      [4, 5, "2"], // due to [3, 4, 9] in row 4
      [3, 8, "5"], // due to [3, 6, 9] in box 5
      [3, 8, "7"], // due to [3, 6, 9] in box 5
      [5, 6, "2"], // due to [3, 6, 9] in box 5
      [5, 6, "5"], // due to [3, 6, 9] in box 5
      [5, 6, "7"], // due to [3, 6, 9] in box 5
      [5, 8, "5"], // due to [3, 6, 9] in box 5
      [5, 8, "7"], // due to [3, 6, 9] in box 5
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToHiddenTriplets test 1", () => {
    const s = new SudokuSolver(p3);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToHiddenTriplets()).toBe(10);
  });

  it("removeCandidatesDueToHiddenTriplets test 2", () => {
    const s = new SudokuSolver(p4);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToHiddenTriplets()).toBe(13);
  });
});