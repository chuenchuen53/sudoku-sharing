import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TU from "../utils";
import type { InputClues, InputValueData, HiddenMultipleFromVirtualLinesResult } from "../../src/Sudoku/type";

const p5: InputClues = [
  ["0", "0", "2", "0", "1", "0", "0", "0", "0"],
  ["1", "0", "0", "0", "8", "0", "0", "5", "4"],
  ["0", "6", "0", "0", "2", "0", "9", "1", "3"],
  ["6", "0", "5", "0", "0", "0", "4", "0", "9"],
  ["0", "0", "0", "0", "0", "8", "1", "0", "0"],
  ["2", "0", "0", "7", "0", "0", "0", "0", "0"],
  ["9", "0", "0", "0", "0", "0", "0", "0", "5"],
  ["0", "0", "0", "0", "4", "0", "0", "0", "6"],
  ["4", "7", "3", "0", "0", "6", "0", "0", "1"],
];

describe("sudoku solver", () => {
  it("getHiddenMultipleFromVirtualLines sizeOfCandidate=4", () => {
    const line = TU.virtualLineFactory([
      ["1", "2", "9"],
      undefined,
      ["1", "2", "3", "4", "9"],
      ["3", "4", "7", "8", "9"],
      undefined,
      ["3", "4", "5"],
      ["1", "2", "3", "4", "5", "6", "7", "8"],
      undefined,
      ["5", "6", "7", "8", "9"],
    ]);

    const result = SudokuSolver.getHiddenMultipleFromVirtualLines([line], 4);
    const expectResult: HiddenMultipleFromVirtualLinesResult[] = [
      {
        combination: ["5", "6", "7", "8"],
        multiple: [line[3], line[5], line[6], line[8]],
        elimination: TU.inputValueDataArrFactory([
          [0, 3, "3"],
          [0, 3, "4"],
          [0, 3, "9"],
          [0, 5, "3"],
          [0, 5, "4"],
          [0, 6, "1"],
          [0, 6, "2"],
          [0, 6, "3"],
          [0, 6, "4"],
          [0, 8, "9"],
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(p5);
    s.setBasicCandidates();
    const result = s.getRemovalDueToHiddenQuads();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [0, 0, "7"], // due to [3, 4, 5, 9] in row 0
      [0, 0, "8"], // due to [3, 4, 5, 9] in row 0
      [0, 1, "8"], // due to [3, 4, 5, 9] in row 0
      [0, 3, "6"], // due to [3, 4, 5, 9] in row 0
      [0, 5, "7"], // due to [3, 4, 5, 9] in row 0

      [3, 1, "3"], // due to [1, 2, 7, 8] in row 3
      [3, 3, "3"], // due to [1, 2, 7, 8] in row 3
      [3, 5, "3"], // due to [1, 2, 7, 8] in row 3
      [3, 7, "3"], // due to [1, 2, 7, 8] in row 3

      [4, 4, "3"], // due to [5, 6, 7, 9] in column 4
      [5, 4, "3"], // due to [5, 6, 7, 9] in column 4
      [6, 4, "3"], // due to [5, 6, 7, 9] in column 4

      [4, 3, "2"], // due to [4, 5, 6, 9] in box 4
      [4, 3, "3"], // due to [4, 5, 6, 9] in box 4
      // [4, 4, "3"], // due to [4, 5, 6, 9] in box 4 (duplicated)
      // [5, 4, "3"], // due to [4, 5, 6, 9] in box 4 (duplicated)
      [5, 5, "1"], // due to [4, 5, 6, 9] in box 4
      [5, 5, "3"], // due to [4, 5, 6, 9] in box 4
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToHiddenQuads test 1", () => {
    const s = new SudokuSolver(p5);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToHiddenQuads()).toBe(16);
  });
});
