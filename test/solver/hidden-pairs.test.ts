import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType, type InputClues, type InputValueData } from "../../src/Sudoku/type";
import Sudoku from "@/Sudoku/Sudoku";
import HiddenPairs from "@/Sudoku/EliminationStrategy/HiddenPairs";
import { SudokuLine } from "@/Sudoku/SudokuLine";
import EliminationStrategy from "@/Sudoku/EliminationStrategy/EliminationStrategy";

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
  it("hiddenPairsFromVirtualLines", () => {
    const line = TestUtil.virtualLineFactory([
      ["1", "2", "8", "9"],
      undefined,
      ["1", "2", "3", "4", "9"],
      ["3", "4", "7", "8"],
      undefined,
      ["3", "4"],
      ["1", "2", "3", "4", "5", "6"],
      undefined,
      ["5", "6", "7", "8"],
    ]);

    const result = HiddenPairs.hiddenPairsFromVirtualLines([line], VirtualLineType.ROW);
    console.log("file: hidden-pairs.test.ts:48 ~ it ~ result:", JSON.stringify(result, null, 2));
    const expectResult: typeof result = [
      {
        // combination: ["5", "6"],
        // multiple: [line[6], line[8]],
        eliminations: TestUtil.eliminationArrFactory([
          [0, 6, ["1", "2", "3", "4"]],
          // [0, 6, "2"],
          // [0, 6, "3"],
          // [0, 6, "4"],
          [0, 8, ["7", "8"]],
          // [0, 8, "8"],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 6 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6"]),
          },
        ],
      },
    ];
    console.log("file: hidden-pairs.test.ts:74 ~ it ~ expectResult:", JSON.stringify(expectResult, null, 2));

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.hiddenPairs.canEliminate(s.sudoku));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [0, 7, "7"], // due to [1, 2] in column 7
      [0, 7, "8"], // due to [1, 2] in column 7
      [1, 7, "7"], // due to [1, 2] in column 7
      [1, 7, "8"], // due to [1, 2] in column 7
      // [0, 7, "7"], // due to [1, 2] in box 2 (duplicated)
      // [0, 7, "8"], // due to [1, 2] in box 2 (duplicated)
      // [1, 7, "7"], // due to [1, 2] in box 2 (duplicated)
      // [1, 7, "8"], // due to [1, 2] in box 2 (duplicated)
      [4, 7, "3"], // due to [6, 8] in box 5
      [4, 7, "5"], // due to [6, 8] in box 5
      [4, 7, "7"], // due to [6, 8] in box 5
      [5, 8, "5"], // due to [6, 8] in box 5
      [5, 8, "7"], // due to [6, 8] in box 5
      [8, 3, "9"], // due to [1, 2] in box 7
      [8, 4, "9"], // due to [1, 2] in box 7
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.hiddenPairs.canEliminate(s.sudoku));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [4, 4, "2"], // due to [3, 4] in row 4
      [4, 4, "5"], // due to [3, 4] in row 4
      [4, 4, "7"], // due to [3, 4] in row 4
      [4, 4, "9"], // due to [3, 4] in row 4
      [4, 5, "2"], // due to [3, 4] in row 4
      [4, 5, "9"], // due to [3, 4] in row 4
      [6, 7, "2"], // due to [1, 8] in column 7
      [6, 7, "5"], // due to [1, 8] in column 7
      [8, 7, "2"], // due to [1, 8] in column 7
      [8, 7, "5"], // due to [1, 8] in column 7
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToHiddenPairs test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToHiddenPairs()).toBe(11);
  });

  it("removeCandidatesDueToHiddenPairs test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToHiddenPairs()).toBe(10);
  });
});
