import { expect, describe, it } from "vitest";
import SudokuSolver, { NakedPairsTripletsQuadsResult } from "../../src/Sudoku/SudokuSolver";
import { InputClues, InputValueData } from "../../src/Sudoku/type";
import TU from "../utils";

const testPuzzle0: InputClues = [
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
  it("getNakedPairsFromVirtualLines", () => {
    const s = new SudokuSolver(testPuzzle0);
    const line = TU.candidatesLineFactory([
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "4"],
      ["1", "2"],
      ["1", "2"],
      ["3", "5"],
      undefined,
      ["3", "5"],
      undefined,
      ["5", "6", "7"],
    ]);

    const result = s.getNakedPairsFromVirtualLines([line]);
    const expectResult: NakedPairsTripletsQuadsResult[] = [
      {
        cells: [line[2], line[3]],
        elimination: TU.inputValueDataArrFactory([
          [0, 0, "1"],
          [0, 0, "2"],
          [0, 1, "1"],
          [0, 1, "2"],
        ]),
      },
      {
        cells: [line[4], line[6]],
        elimination: TU.inputValueDataArrFactory([
          [0, 0, "3"],
          [0, 0, "5"],
          [0, 8, "5"],
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(testPuzzle0);
    s.getBasicCandidates();
    const result = s.getRemovalDueToNakedPairs();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [4, 8, "5"],
      [4, 8, "7"],
      [7, 8, "5"],
      [7, 8, "7"],
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(testPuzzle1);
    s.getBasicCandidates();
    const result = s.getRemovalDueToNakedPairs();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [6, 8, "5"],
      [1, 6, "3"],
      [1, 7, "3"],
      [1, 7, "5"],
      [2, 6, "3"],
    ]);

    expect(result).toStrictEqual(expectResult);
  });
});
