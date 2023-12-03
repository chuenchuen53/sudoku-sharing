import { expect, describe, it } from "vitest";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType, type InputClues, type PositionAndValue } from "../../core/Sudoku/type";
import Sudoku from "../../core/Sudoku/Sudoku";
import NakedTriplets from "../../core/Sudoku/EliminationStrategy/NakedTriplets";
import { SudokuLine } from "../../core/Sudoku/SudokuLine";
import EliminationStrategy, { EliminationStrategyType } from "../../core/Sudoku/EliminationStrategy/EliminationStrategy";

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
  it("nakedTripletsFromVirtualLines", () => {
    const line = TestUtil.virtualLineFactory([
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

    const result = NakedTriplets.nakedTripletsFromVirtualLines([line], VirtualLineType.ROW);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          [0, 0, ["1", "2", "4"]],
          [0, 4, ["4"]],
          [0, 8, ["1", "2"]],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 1 },
            candidates: Sudoku.candidatesFactory(true, ["1", "2", "4"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 2 },
            candidates: Sudoku.candidatesFactory(true, ["1", "2"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["1", "4"]),
          },
        ],
      },
    ];
    expect(result).toEqual(expectResult);
  });

  it("canEliminate test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_TRIPLETS));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
      [1, 6, "7"], // due to column 6 - 347
      [1, 7, "2"], // due to box 2 - 278
      [1, 7, "7"], // due to box 2 - 278
      [1, 7, "8"], // due to box 2 - 278
      [8, 4, "2"], // due to box 2 - 279
      [8, 4, "9"], // due to box 2 - 279
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("canEliminate test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_TRIPLETS));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
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

  it("removeCandidatesDueToNakedTriplets test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_TRIPLETS)).toBe(6);
  });

  it("removeCandidatesDueToNakedTriplets test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_TRIPLETS)).toBe(23);
  });
});
