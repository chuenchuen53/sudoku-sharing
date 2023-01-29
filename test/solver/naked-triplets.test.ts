import { expect, describe, it } from "vitest";
import SudokuSolver, { NakedPairsTripletsQuadsResult } from "../../src/Sudoku/SudokuSolver";
import { InputClues, InputValueData } from "../../src/Sudoku/type";
import TU from "../utils";

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
  it("getMultipleNakedFromVirtualLines sizeOfCandidate=3", () => {
    const s = new SudokuSolver(p3);
    const line = TU.candidatesLineFactory([
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "4"],
      ["1", "2"],
      ["1", "4"],
      ["4", "5"],
      undefined,
      undefined,
      undefined,
      ["1", "2", "9"],
    ]);

    const result = s.getMultipleNakedFromVirtualLines([line], 3);
    const expectResult: NakedPairsTripletsQuadsResult[] = [
      {
        cells: [line[1], line[2], line[3]],
        elimination: TU.inputValueDataArrFactory([
          [0, 0, "1"],
          [0, 0, "2"],
          [0, 0, "4"],
          [0, 4, "4"],
          [0, 8, "1"],
          [0, 8, "2"],
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(p3);
    s.getBasicCandidates();
    const result = s.getRemovalDueToNakedTriplets();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [1, 6, "7"], // due to column 6 - 347
      [1, 7, "2"], // due to box 2 - 278
      [1, 7, "7"], // due to box 2 - 278
      [1, 7, "8"], // due to box 2 - 278
      [8, 4, "2"], // due to box 2 - 279
      [8, 4, "9"], // due to box 2 - 279
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(p4);
    s.getBasicCandidates();
    const result = s.getRemovalDueToNakedTriplets();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [2, 1, "1"], // due to row 2 169
      [2, 1, "6"], // due to row 2 169
      [4, 3, "2"], // due to row 4 257
      [4, 3, "7"], // due to row 4 257
      [4, 4, "2"], // due to row 4 257
      [4, 4, "5"], // due to row 4 257
      [4, 4, "7"], // due to row 4 257
      [4, 5, "2"], // due to row 4 257
      [6, 7, "2"], // due to column 7 257
      [6, 7, "5"], // due to column 7 257
      [8, 7, "2"], // due to column 7 257
      [8, 7, "5"], // due to column 7 257
      [4, 0, "2"], // due to box 3 125
      [4, 0, "5"], // due to box 3 125
      [3, 8, "5"], // due to box 5 257
      [3, 8, "7"], // due to box 5 257
      [5, 6, "2"], // due to box 5 257
      [5, 6, "5"], // due to box 5 257
      [5, 6, "7"], // due to box 5 257
      [5, 8, "5"], // due to box 5 257
      [5, 8, "7"], // due to box 5 257
      [8, 4, "2"], // due to box 7 289
      [8, 4, "9"], // due to box 7 289
    ]);
    expect(result).toStrictEqual(expectResult);
  });
});
