import { expect, describe, it } from "vitest";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { type InputClues, type InputValueData, VirtualLineType } from "../../core/Sudoku/type";
import Sudoku from "../../core/Sudoku/Sudoku";
import HiddenQuads from "../../core/Sudoku/EliminationStrategy/HiddenQuads";
import { SudokuLine } from "../../core/Sudoku/SudokuLine";
import EliminationStrategy, { EliminationStrategyType } from "../../core/Sudoku/EliminationStrategy/EliminationStrategy";

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
  it("hiddenQuadsFromVirtualLines", () => {
    const line = TestUtil.virtualLineFactory([
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

    const result = HiddenQuads.hiddenQuadsFromVirtualLines([line], VirtualLineType.ROW);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          [0, 3, ["3", "4", "9"]],
          [0, 5, ["3", "4"]],
          [0, 6, ["1", "2", "3", "4"]],
          [0, 8, ["9"]],
        ]),
        relatedLines: [SudokuLine.ROW_0],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["7", "8"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 5 },
            candidates: Sudoku.candidatesFactory(true, ["5"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 6 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6", "7", "8"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["5", "6", "7", "8"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("hiddenQuads test 1", () => {
    const s = new SudokuSolver(new Sudoku(p5));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.HIDDEN_QUADS));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
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
    const s = new SudokuSolver(new Sudoku(p5));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.HIDDEN_QUADS)).toBe(16);
  });
});
