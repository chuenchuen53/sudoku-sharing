import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType, type InputClues, type InputValueData } from "../../src/Sudoku/type";
import Sudoku from "@/Sudoku/Sudoku";
import NakedPairs from "@/Sudoku/EliminationStrategy/NakedPairs";
import EliminationStrategy, { EliminationStrategyType } from "@/Sudoku/EliminationStrategy/EliminationStrategy";
import { SudokuLine } from "@/Sudoku/SudokuLine";

const p0: InputClues = [
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

const p1: InputClues = [
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
    const line = TestUtil.virtualLineFactory([
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

    const result = NakedPairs.nakedPairsFromVirtualLines([line], VirtualLineType.ROW);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          [0, 0, ["1", "2"]],
          [0, 1, ["1", "2"]],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 2 },
            candidates: Sudoku.candidatesFactory(true, ["1", "2"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["1", "2"]),
          },
        ],
      },
      {
        eliminations: TestUtil.eliminationArrFactory([
          [0, 0, ["3", "5"]],
          [0, 8, ["5"]],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 4 },
            candidates: Sudoku.candidatesFactory(true, ["3", "5"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 6 },
            candidates: Sudoku.candidatesFactory(true, ["3", "5"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const removals = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_PAIRS));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [4, 8, "5"],
      [4, 8, "7"],
      [7, 8, "5"],
      [7, 8, "7"],
    ]);
    expect(removals).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    const removals = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_PAIRS));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [6, 8, "5"],
      [1, 6, "3"],
      [1, 7, "3"],
      [1, 7, "5"],
      [2, 6, "3"],
    ]);

    expect(removals).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_PAIRS)).toStrictEqual(4);
  });

  it("removeCandidatesDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_PAIRS)).toStrictEqual(5);
  });
});
