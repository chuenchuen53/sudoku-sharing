import { expect, describe, it } from "vitest";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { type InputClues, type PositionAndValue, VirtualLineType } from "../../core/Sudoku/type";
import Sudoku from "../../core/Sudoku/Sudoku";
import HiddenTriplets from "../../core/Sudoku/EliminationStrategy/HiddenTriplets";
import { SudokuLine } from "../../core/Sudoku/SudokuLine";
import EliminationStrategy from "../../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { EliminationStrategyType } from "../../core/Sudoku/EliminationStrategy/type";

const p2: InputClues = [
  ["0", "3", "0", "9", "0", "0", "0", "0", "0"],
  ["6", "0", "0", "2", "0", "0", "8", "0", "0"],
  ["8", "0", "0", "6", "1", "0", "5", "4", "9"],
  ["0", "0", "0", "0", "3", "2", "1", "0", "0"],
  ["2", "0", "8", "0", "4", "0", "0", "0", "0"],
  ["0", "0", "3", "1", "9", "0", "0", "0", "4"],
  ["9", "0", "2", "0", "0", "0", "0", "0", "5"],
  ["1", "0", "0", "0", "0", "0", "0", "6", "0"],
  ["0", "0", "4", "0", "6", "0", "9", "0", "8"],
];

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
  it("hiddenTripletsFromVirtualLines", () => {
    const line = TestUtil.virtualLineFactory([
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

    const result = HiddenTriplets.hiddenTripletsFromVirtualLines([line], VirtualLineType.ROW);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          [0, 3, ["3", "4", "8", "9"]],
          [0, 6, ["1", "2", "3", "4"]],
          [0, 8, ["8"]],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["7"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 6 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6", "7"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6", "7"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("hiddenTriplets test 1", () => {
    const s = new SudokuSolver(new Sudoku(p2));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.HIDDEN_TRIPLETS));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
      [1, 1, "5"], // due to [1, 4, 9] in column 1
      [1, 1, "7"], // due to [1, 4, 9] in column 1
      [3, 1, "5"], // due to [1, 4, 9] in column 1
      [3, 1, "6"], // due to [1, 4, 9] in column 1
      [3, 1, "7"], // due to [1, 4, 9] in column 1
      [4, 1, "5"], // due to [1, 4, 9] in column 1
      [4, 1, "6"], // due to [1, 4, 9] in column 1
      [4, 1, "7"], // due to [1, 4, 9] in column 1
      [0, 2, "5"], // due to [1, 6, 9] in column 2
      [0, 2, "7"], // due to [1, 6, 9] in column 2
      [1, 2, "5"], // due to [1, 6, 9] in column 2
      [1, 2, "7"], // due to [1, 6, 9] in column 2
      [3, 2, "5"], // due to [1, 6, 9] in column 2
      [3, 2, "7"], // due to [1, 6, 9] in column 2
      [3, 7, "7"], // due to [5, 8, 9] in column 7
      [4, 7, "3"], // due to [5, 8, 9] in column 7
      [4, 7, "7"], // due to [5, 8, 9] in column 7
      [5, 7, "2"], // due to [5, 8, 9] in column 7
      [5, 7, "7"], // due to [5, 8, 9] in column 7
      // [3, 7, "7"], // due to [5, 8, 9] in box 5 (duplicated)
      // [4, 7, "3"], // due to [5, 8, 9] in box 5 (duplicated)
      // [4, 7, "7"], // due to [5, 8, 9] in box 5 (duplicated)
      // [5, 7, "2"], // due to [5, 8, 9] in box 5 (duplicated)
      // [5, 7, "7"], // due to [5, 8, 9] in box 5 (duplicated)
      [6, 1, "7"], // due to [3, 6, 8] in box 6
      [7, 1, "5"], // due to [3, 6, 8] in box 6
      [7, 1, "7"], // due to [3, 6, 8] in box 6
      [8, 0, "5"], // due to [3, 6, 8] in box 6
      [8, 0, "7"], // due to [3, 6, 8] in box 6
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("hiddenTriplets test 2", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.HIDDEN_TRIPLETS));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
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

  it("hiddenTriplets test 3", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.HIDDEN_TRIPLETS));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
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
    const s = new SudokuSolver(new Sudoku(p2));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.HIDDEN_TRIPLETS)).toBe(24);
  });

  it("removeCandidatesDueToHiddenTriplets test 2", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.HIDDEN_TRIPLETS)).toBe(10);
  });

  it("removeCandidatesDueToHiddenTriplets test 3", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.HIDDEN_TRIPLETS)).toBe(13);
  });
});
