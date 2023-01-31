import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import { VirtualLineType } from "../../src/Sudoku/type";
import TU from "../utils";
import type { InputClues, InputValueData, SudokuElement, XWingSwordfishResult } from "../../src/Sudoku/type";

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

const undefinedCandidates: undefined[] = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
];

describe("sudoku solver", () => {
  it("x wing test 1", () => {
    const row0 = TU.virtualLineFactory(
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
      }
    );
    const row1 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 1 });
    const row2 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 2 });
    const row3 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 3 });
    const row4 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 4 });
    const row5 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 5 });
    const row6 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 6 });
    const row7 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 7 });
    const row8 = TU.virtualLineFactory(
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
      { type: VirtualLineType.ROW, lineIndex: 8 }
    );

    const column0 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 0 });
    const column1 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 1 });
    const column2 = TU.virtualLineFactory(sampleCandidates, { type: VirtualLineType.COLUMN, lineIndex: 2 });
    const column3 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 3 });
    const column4 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 4 });
    const column5 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    const column6 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 6 });
    const column7 = TU.virtualLineFactory(sampleCandidates, { type: VirtualLineType.COLUMN, lineIndex: 7 });
    const column8 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.COLUMN, lineIndex: 8 });

    const allRows = [row0, row1, row2, row3, row4, row5, row6, row7, row8];
    const allColumns = [column0, column1, column2, column3, column4, column5, column6, column7, column8];

    const result = SudokuSolver.getXWingFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const expectResult: XWingSwordfishResult[] = [
      {
        sudokuElement: "3",
        multiple: [row0[1], row0[7], row8[1], row8[7]],
        elimination: TU.inputValueDataArrFactory([
          // [0, 1, "3"], // in multiple
          [1, 1, "3"],
          [2, 1, "3"],
          [3, 1, "3"],
          [4, 1, "3"],
          [5, 1, "3"],
          [6, 1, "3"],
          [7, 1, "3"],
          // [8, 1, "3"], // in multiple

          // [0, 7, "3"], // in multiple
          [2, 7, "3"],
          [4, 7, "3"],
          [6, 7, "3"],
          // [8, 7, "3"], // in multiple
        ]),
      },
      {
        sudokuElement: "6",
        multiple: [row0[2], row0[3], row8[2], row8[3]],
        elimination: TU.inputValueDataArrFactory([
          // [0, 2, "6"], // in multiple
          [2, 2, "6"],
          [4, 2, "6"],
          [6, 2, "6"],
          // [8, 2, "6"], // in multiple

          // [0, 3, "6"], // in multiple
          [1, 3, "6"],
          [2, 3, "6"],
          [3, 3, "6"],
          [4, 3, "6"],
          [5, 3, "6"],
          [6, 3, "6"],
          [7, 3, "6"],
          // [8, 3, "6"], // in multiple
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("x wing test 2", () => {
    const column0 = TU.virtualLineFactory(
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
      }
    );
    const column1 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 1 });
    const column2 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 2 });
    const column3 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 3 });
    const column4 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 4 });
    const column5 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    const column6 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 6 });
    const column7 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.COLUMN, lineIndex: 7 });
    const column8 = TU.virtualLineFactory(
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
      { type: VirtualLineType.COLUMN, lineIndex: 8 }
    );

    const row0 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 0 });
    const row1 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 1 });
    const row2 = TU.virtualLineFactory(sampleCandidates, { type: VirtualLineType.ROW, lineIndex: 2 });
    const row3 = TU.virtualLineFactory(allCandidates, { type: VirtualLineType.ROW, lineIndex: 3 });
    const row4 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 4 });
    const row5 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 5 });
    const row6 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 6 });
    const row7 = TU.virtualLineFactory(sampleCandidates, { type: VirtualLineType.ROW, lineIndex: 7 });
    const row8 = TU.virtualLineFactory(undefinedCandidates, { type: VirtualLineType.ROW, lineIndex: 8 });

    const allRows = [row0, row1, row2, row3, row4, row5, row6, row7, row8];
    const allColumns = [column0, column1, column2, column3, column4, column5, column6, column7, column8];

    const result = SudokuSolver.getXWingFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    const expectResult: XWingSwordfishResult[] = [
      {
        sudokuElement: "3",
        multiple: [column0[1], column0[7], column8[1], column8[7]],
        elimination: TU.inputValueDataArrFactory([
          // [1, 0, "3"], // in multiple
          [1, 1, "3"],
          [1, 2, "3"],
          [1, 3, "3"],
          [1, 4, "3"],
          [1, 5, "3"],
          [1, 6, "3"],
          [1, 7, "3"],
          // [1, 8, "3"], // in multiple

          // [7, 0, "3"], // in multiple
          [7, 2, "3"],
          [7, 4, "3"],
          [7, 6, "3"],
          // [7, 8, "3"], // in multiple
        ]),
      },
      {
        sudokuElement: "6",
        multiple: [column0[2], column0[3], column8[2], column8[3]],
        elimination: TU.inputValueDataArrFactory([
          // [2, 0, "6"], // in multiple
          [2, 2, "6"],
          [2, 4, "6"],
          [2, 6, "6"],
          // [2, 8, "6"], // in multiple

          // [3, 0, "6"], // in multiple
          [3, 1, "6"],
          [3, 2, "6"],
          [3, 3, "6"],
          [3, 4, "6"],
          [3, 5, "6"],
          [3, 6, "6"],
          [3, 7, "6"],
          // [3, 8, "6"], // in multiple
        ]),
      },
    ];

    expect(result).toEqual(expectResult);
  });

  it("getRemovalDueToXWing test 1", () => {
    const s = new SudokuSolver(p0);
    s.setBasicCandidates();
    const result = s.getRemovalDueToXWing();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [1, 3, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [1, 4, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [1, 5, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [7, 4, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
      [7, 5, "2"], // due to element "2" in [1, 6], [7, 6], [1, 8], [7, 8]
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToXWing test 2", () => {
    const s = new SudokuSolver(p2);
    s.setBasicCandidates();
    const result = s.getRemovalDueToXWing();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
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
    const s = new SudokuSolver(p0);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToXWing()).toBe(5);
  });

  it("removeCandidatesDueToXWing test 2", () => {
    const s = new SudokuSolver(p2);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToXWing()).toBe(5);
  });
});
