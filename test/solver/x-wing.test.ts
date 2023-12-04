import { expect, describe, it } from "vitest";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import { VirtualLineType } from "../../core/Sudoku/type";
import TestUtil from "../TestUtil";
import Sudoku from "../../core/Sudoku/Sudoku";
import XWing from "../../core/Sudoku/EliminationStrategy/XWing";
import { SudokuLine } from "../../core/Sudoku/SudokuLine";
import EliminationStrategy from "../../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { EliminationStrategyType } from "../../core/Sudoku/EliminationStrategy/type";
import type { InputClues, PositionAndValue, SudokuElement } from "../../core/Sudoku/type";

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

const allCandidates: SudokuElement[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
];

const sampleCandidates: (SudokuElement[] | undefined)[] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "4", "5", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "4", "5", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "4", "5", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["1", "2", "4", "5", "7", "8", "9"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
];

const undefinedCandidates: undefined[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

describe("sudoku solver", () => {
  it("xWingFromVirtualLines test 1", () => {
    const row0 = TestUtil.virtualLineFactory(
      [
        ["1", "2", "4", "5", "7", "8", "9"],
        ["3", "4", "5"],
        ["6", "7", "8", "9"],
        ["4", "5", "6"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "3"],
        ["1", "2", "4", "5", "7", "8", "9"],
      ],
      {
        type: VirtualLineType.ROW,
        lineIndex: 0,
      },
    );
    const row1 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 1 });
    const row2 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 2 });
    const row3 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 3 });
    const row4 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 4 });
    const row5 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 5 });
    const row6 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 6 });
    const row7 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 7 });
    const row8 = TestUtil.virtualLineFactory(
      [
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["6", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["3", "4", "5"],
        ["1", "2", "4", "5", "7", "8", "9"],
      ],
      { type: VirtualLineType.ROW, lineIndex: 8 },
    );

    const column0 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 0 });
    const column1 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 1 });
    const column2 = TestUtil.virtualLineFactory(sampleCandidates, { type: VirtualLineType.COLUMN, lineIndex: 2 });
    const column3 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 3 });
    const column4 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 4 });
    const column5 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    const column6 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 6 });
    const column7 = TestUtil.virtualLineFactory(sampleCandidates, { type: VirtualLineType.COLUMN, lineIndex: 7 });
    const column8 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 8 });

    const allRows = [row0, row1, row2, row3, row4, row5, row6, row7, row8];
    const allColumns = [column0, column1, column2, column3, column4, column5, column6, column7, column8];

    const result = XWing.xWingFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          // [0, 1, ["3"]], // in multiple
          [1, 1, ["3"]],
          [2, 1, ["3"]],
          [3, 1, ["3"]],
          [4, 1, ["3"]],
          [5, 1, ["3"]],
          [6, 1, ["3"]],
          [7, 1, ["3"]],
          // [8, 1, ["3"]], // in multiple

          // [0, 7, ["3"]], // in multiple
          [2, 7, ["3"]],
          [4, 7, ["3"]],
          [6, 7, ["3"]],
          // [8, 7, ["3"]], // in multiple
        ]),
        relatedLines: [SudokuLine.ROW_0, SudokuLine.ROW_8, SudokuLine.COLUMN_1, SudokuLine.COLUMN_7],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 1 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 7 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 8, columnIndex: 1 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 8, columnIndex: 7 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
        ],
      },
      {
        eliminations: TestUtil.eliminationArrFactory([
          // [0, 2, ["6"]], // in multiple
          [2, 2, ["6"]],
          [4, 2, ["6"]],
          [6, 2, ["6"]],
          // [8, 2, ["6"]], // in multiple

          // [0, 3, ["6"]], // in multiple
          [1, 3, ["6"]],
          [2, 3, ["6"]],
          [3, 3, ["6"]],
          [4, 3, ["6"]],
          [5, 3, ["6"]],
          [6, 3, ["6"]],
          [7, 3, ["6"]],
          // [8, 3, ["6"]], // in multiple
        ]),
        relatedLines: [SudokuLine.ROW_0, SudokuLine.ROW_8, SudokuLine.COLUMN_2, SudokuLine.COLUMN_3],
        highlights: [
          {
            position: { rowIndex: 0, columnIndex: 2 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 0, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 8, columnIndex: 2 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 8, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("xWingFromVirtualLines test 2", () => {
    const column0 = TestUtil.virtualLineFactory(
      [
        ["1", "2", "4", "5", "7", "8", "9"],
        ["3", "4", "5"],
        ["6", "7", "8", "9"],
        ["4", "5", "6"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "3"],
        ["1", "2", "4", "5", "7", "8", "9"],
      ],
      {
        type: VirtualLineType.COLUMN,
        lineIndex: 0,
      },
    );
    const column1 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 1 });
    const column2 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 2 });
    const column3 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 3 });
    const column4 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 4 });
    const column5 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    const column6 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 6 });
    const column7 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 7 });
    const column8 = TestUtil.virtualLineFactory(
      [
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["6", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["1", "2", "4", "5", "7", "8", "9"],
        ["3", "4", "5"],
        ["1", "2", "4", "5", "7", "8", "9"],
      ],
      { type: VirtualLineType.COLUMN, lineIndex: 8 },
    );

    const row0 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 0 });
    const row1 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 1 });
    const row2 = TestUtil.virtualLineFactory(sampleCandidates, { type: VirtualLineType.ROW, lineIndex: 2 });
    const row3 = TestUtil.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 3 });
    const row4 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 4 });
    const row5 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 5 });
    const row6 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 6 });
    const row7 = TestUtil.virtualLineFactory(sampleCandidates, { type: VirtualLineType.ROW, lineIndex: 7 });
    const row8 = TestUtil.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 8 });

    const allRows = [row0, row1, row2, row3, row4, row5, row6, row7, row8];
    const allColumns = [column0, column1, column2, column3, column4, column5, column6, column7, column8];

    const result = XWing.xWingFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([
          // [1, 0, ["3"]], // in multiple
          [1, 1, ["3"]],
          [1, 2, ["3"]],
          [1, 3, ["3"]],
          [1, 4, ["3"]],
          [1, 5, ["3"]],
          [1, 6, ["3"]],
          [1, 7, ["3"]],
          // [1, 8, ["3"]], // in multiple

          // [7, 0, ["3"]], // in multiple
          [7, 2, ["3"]],
          [7, 4, ["3"]],
          [7, 6, ["3"]],
          // [7, 8, ["3"]], // in multiple
        ]),
        relatedLines: [SudokuLine.COLUMN_0, SudokuLine.COLUMN_8, SudokuLine.ROW_1, SudokuLine.ROW_7],
        highlights: [
          {
            position: { rowIndex: 1, columnIndex: 0 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 7, columnIndex: 0 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 1, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
          {
            position: { rowIndex: 7, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["3"]),
          },
        ],
      },
      {
        eliminations: TestUtil.eliminationArrFactory([
          // [2, 0, ["6"]], // in multiple
          [2, 2, ["6"]],
          [2, 4, ["6"]],
          [2, 6, ["6"]],
          // [2, 8, ["6"]], // in multiple

          // [3, 0, ["6"]], // in multiple
          [3, 1, ["6"]],
          [3, 2, ["6"]],
          [3, 3, ["6"]],
          [3, 4, ["6"]],
          [3, 5, ["6"]],
          [3, 6, ["6"]],
          [3, 7, ["6"]],
          // [3, 8, ["6"]], // in multiple
        ]),
        relatedLines: [SudokuLine.COLUMN_0, SudokuLine.COLUMN_8, SudokuLine.ROW_2, SudokuLine.ROW_3],
        highlights: [
          {
            position: { rowIndex: 2, columnIndex: 0 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 3, columnIndex: 0 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 2, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
          {
            position: { rowIndex: 3, columnIndex: 8 },
            candidates: Sudoku.candidatesFactory(true, ["6"]),
          },
        ],
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToXWing test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.X_WING));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
      [1, 3, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [1, 4, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [1, 5, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [7, 4, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [7, 5, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToXWing test 2", () => {
    const s = new SudokuSolver(new Sudoku(p2));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.X_WING));
    const expectResult: PositionAndValue[] = TestUtil.inputValueDataArrFactory([
      [0, 7, "1"], // due to element "1" in [6, 5], [6, 7], [8, 5], [8, 7]
      [1, 7, "1"], // due to element "1" in [6, 5], [6, 7], [8, 5], [8, 7]
      // [0, 7, "1"], // due to element "1" in [0, 2], [1, 2], [0, 8], [1, 8] (duplicate)
      [1, 1, "1"], // due to element "1" in [0, 2], [1, 2], [0, 8], [1, 8]
      // [1, 7, "1"], // due to element "1" in [0, 2], [1, 2], [0, 8], [1, 8] (duplicate)
      [6, 5, "4"], // due to element "4" in [6, 3], [7, 3], [6, 6], [7, 6]
      [7, 5, "4"], // due to element "4" in [6, 3], [7, 3], [6, 6], [7, 6]
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToXWing test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.X_WING)).toBe(5);
  });

  it("removeCandidatesDueToXWing test 2", () => {
    const s = new SudokuSolver(new Sudoku(p2));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.X_WING)).toBe(5);
  });
});
