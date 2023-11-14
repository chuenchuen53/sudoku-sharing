import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType, type InputClues, type InputValueData } from "../../src/Sudoku/type";
import Sudoku from "@/Sudoku/Sudoku";
import NakedQuads from "@/Sudoku/EliminationStrategy/NakedQuads";
import { SudokuLine } from "@/Sudoku/SudokuLine";
import EliminationStrategy, { EliminationStrategyType } from "@/Sudoku/EliminationStrategy/EliminationStrategy";

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
  it("getMultipleNakedFromVirtualLines sizeOfCandidate=4", () => {
    const line = TestUtil.virtualLineFactory([
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "4"],
      ["1", "2", "3"],
      ["1", "4"],
      ["2", "4"],
      ["1", "4", "5", "6", "7", "8", "9"],
      ["2", "7", "8", "9"],
      undefined,
      ["1", "2", "5", "9"],
    ]);

    const result = NakedQuads.nakedQuadsFromVirtualLines([line], VirtualLineType.ROW);
    const expectResult: typeof result = [
      {
        // cells: [line[1], line[2], line[3], line[4]],
        eliminations: TestUtil.eliminationArrFactory([
          [0, 0, ["1", "2", "3", "4"]],
          [0, 5, ["1", "4"]],
          [0, 6, ["2"]],
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
            candidates: Sudoku.candidatesFactory(true, ["1", "2", "3"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["1", "4"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 4 },
            candidates: Sudoku.candidatesFactory(true, ["2", "4"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_QUADS));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [4, 7, "3"], // due to row 4 - 3567
      [4, 7, "5"], // due to row 4 - 3567
      [4, 7, "7"], // due to row 4 - 3567
      [8, 1, "3"], // due to column 1 - 3467
      [8, 1, "4"], // due to column 1 - 3467
      [5, 8, "5"], // due to column 8 - 5789
      [5, 8, "7"], // due to column 8 - 5789
      // [4, 7, "3"], // due to box 5 - 3457 (duplicated)
      // [4, 7, "5"], // due to box 5 - 3457 (duplicated)
      // [4, 7, "7"], // due to box 5 - 3457 (duplicated)
      // [5, 8, "5"], // due to box 5 - 3457 (duplicated)
      // [5, 8, "7"], // due to box 5 - 3457 (duplicated)
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToNakedPairs test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.NAKED_QUADS));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [1, 8, "5"], // due to row 1 - 2456
      [4, 4, "2"], // due to row 4 - 2579
      [4, 4, "5"], // due to row 4 - 2579
      [4, 4, "7"], // due to row 4 - 2579
      [4, 4, "9"], // due to row 4 - 2579
      [4, 5, "2"], // due to row 4 - 2579
      [4, 5, "9"], // due to row 4 - 2579
      [6, 7, "2"], // due to column 7 - 2578
      [6, 7, "5"], // due to column 7 - 2578
      [6, 7, "8"], // due to column 7 - 2578
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToNakedQuads test 1", () => {
    const s = new SudokuSolver(new Sudoku(p3));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_QUADS)).toBe(7);
  });

  it("removeCandidatesDueToNakedQuads test 2", () => {
    const s = new SudokuSolver(new Sudoku(p4));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.NAKED_QUADS)).toBe(10);
  });
});
