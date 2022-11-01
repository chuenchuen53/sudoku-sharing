import { expect, describe, it } from "vitest";
import ArrayUtils from "../src/utils/ArrayUtil";
import Sudoku, { CheckVirtualLineDuplicateResult, candidatesFactory } from "../src/Sudoku";
import { CellWithIndex, InputClues, VirtualLineType } from "../src/sudoku/type";

const emptyPuzzle: InputClues = [
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
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

const testPuzzle2: InputClues = [
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

const validateDetailTemplate: () => Record<"row" | "column" | "box", CheckVirtualLineDuplicateResult[]> = () => {
  const t = () =>
    Array(9)
      .fill(null)
      .map((_) => ({ haveDuplicate: false, duplicatedCells: [] as CellWithIndex[] }));
  return {
    row: t(),
    column: t(),
    box: t(),
  };
};

describe("sudoku basic", () => {
  it("createPuzzle", () => {
    const sudoku = new Sudoku(emptyPuzzle);
    const grid1 = sudoku.createPuzzle(testPuzzle1);
    const grid1Expected = [
      [{ clue: "2" }, {}, {}, {}, {}, {}, { clue: "8" }, { clue: "6" }, {}],
      [{}, {}, {}, {}, { clue: "4" }, { clue: "2" }, {}, {}, {}],
      [{}, { clue: "1" }, {}, {}, { clue: "6" }, {}, {}, { clue: "4" }, { clue: "7" }],
      [{ clue: "3" }, { clue: "4" }, { clue: "5" }, {}, { clue: "2" }, {}, {}, {}, { clue: "1" }],
      [{ clue: "7" }, { clue: "2" }, {}, {}, {}, {}, { clue: "4" }, {}, { clue: "9" }],
      [{ clue: "8" }, {}, {}, {}, {}, {}, { clue: "5" }, {}, { clue: "6" }],
      [{}, {}, { clue: "2" }, {}, { clue: "3" }, {}, {}, {}, {}],
      [{}, {}, {}, { clue: "6" }, { clue: "8" }, {}, {}, { clue: "1" }, { clue: "2" }],
      [{ clue: "5" }, {}, { clue: "8" }, {}, {}, {}, {}, {}, { clue: "4" }],
    ];

    const grid2 = sudoku.createPuzzle(testPuzzle2);
    const grid2Expected = [
      [{}, { clue: "3" }, {}, { clue: "9" }, {}, {}, {}, {}, {}],
      [{ clue: "6" }, {}, {}, { clue: "2" }, {}, {}, { clue: "8" }, {}, {}],
      [{ clue: "8" }, {}, {}, { clue: "6" }, { clue: "1" }, {}, { clue: "5" }, { clue: "4" }, { clue: "9" }],
      [{}, {}, {}, {}, { clue: "3" }, { clue: "2" }, { clue: "1" }, {}, {}],
      [{ clue: "2" }, {}, { clue: "8" }, {}, { clue: "4" }, {}, {}, {}, {}],
      [{}, {}, { clue: "3" }, { clue: "1" }, { clue: "9" }, {}, {}, {}, { clue: "4" }],
      [{ clue: "9" }, {}, { clue: "2" }, {}, {}, {}, {}, {}, { clue: "5" }],
      [{ clue: "1" }, {}, {}, {}, {}, {}, {}, { clue: "6" }, {}],
      [{}, {}, { clue: "4" }, {}, { clue: "6" }, {}, { clue: "9" }, {}, { clue: "8" }],
    ];

    expect(grid1).toStrictEqual(grid1Expected);
    expect(grid2).toStrictEqual(grid2Expected);
  });

  it("validatePuzzle", () => {
    const invalidClues1: InputClues = ArrayUtils.cloneArr(testPuzzle1);
    invalidClues1[0][1] = "2";
    const s1 = new Sudoku(invalidClues1);
    const s1DetailExpected = validateDetailTemplate();
    s1DetailExpected.row[0].haveDuplicate = true;
    s1DetailExpected.row[0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { clue: "2", rowIndex: 0, columnIndex: 1 }
    );
    s1DetailExpected.column[1].haveDuplicate = true;
    s1DetailExpected.column[1].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 1 },
      { clue: "2", rowIndex: 4, columnIndex: 1 }
    );
    s1DetailExpected.box[0].haveDuplicate = true;
    s1DetailExpected.box[0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { clue: "2", rowIndex: 0, columnIndex: 1 }
    );
    const s1Expected = {
      isValid: false,
      detail: s1DetailExpected,
    };

    expect(s1.validatePuzzle("clue")).toStrictEqual(s1Expected);
  });

  it("validatePuzzle", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue([{ rowIndex: 0, columnIndex: 1, value: "2" }]);
    const s1DetailExpected = validateDetailTemplate();
    s1DetailExpected.row[0].haveDuplicate = true;
    s1DetailExpected.row[0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { inputValue: "2", rowIndex: 0, columnIndex: 1 }
    );
    s1DetailExpected.column[1].haveDuplicate = true;
    s1DetailExpected.column[1].duplicatedCells.push(
      { inputValue: "2", rowIndex: 0, columnIndex: 1 },
      { clue: "2", rowIndex: 4, columnIndex: 1 }
    );
    s1DetailExpected.box[0].haveDuplicate = true;
    s1DetailExpected.box[0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { inputValue: "2", rowIndex: 0, columnIndex: 1 }
    );
    const s1Expected = {
      isValid: false,
      detail: s1DetailExpected,
    };

    expect(s1.validatePuzzle("inputValue")).toStrictEqual(s1Expected);
  });

  it("validatePuzzle", () => {
    const invalidClues1: InputClues = ArrayUtils.cloneArr(testPuzzle1);

    invalidClues1[2][0] = "6";
    invalidClues1[2][3] = "1";
    invalidClues1[2][6] = "1";
    const s1 = new Sudoku(invalidClues1);
    const s1DetailExpected = validateDetailTemplate();
    s1DetailExpected.row[2].haveDuplicate = true;
    s1DetailExpected.row[2].duplicatedCells.push(
      { clue: "6", rowIndex: 2, columnIndex: 0 },
      { clue: "1", rowIndex: 2, columnIndex: 1 },
      { clue: "1", rowIndex: 2, columnIndex: 3 },
      { clue: "6", rowIndex: 2, columnIndex: 4 },
      { clue: "1", rowIndex: 2, columnIndex: 6 }
    );
    const s1Expected = {
      isValid: false,
      detail: s1DetailExpected,
    };

    expect(s1.validatePuzzle("clue")).toStrictEqual(s1Expected);
  });

  it("numberOfClues", () => {
    const noc = (i: InputClues) => i.flat(1).reduce((acc, cur) => (cur !== "0" ? acc + 1 : acc), 0);
    expect(new Sudoku(testPuzzle1).numberOfClues).toBe(noc(testPuzzle1));
    expect(new Sudoku(testPuzzle2).numberOfClues).toBe(noc(testPuzzle2));
  });

  it("getRow", () => {
    const s1 = new Sudoku(testPuzzle1);

    const r0 = [
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { rowIndex: 0, columnIndex: 1 },
      { rowIndex: 0, columnIndex: 2 },
      { rowIndex: 0, columnIndex: 3 },
      { rowIndex: 0, columnIndex: 4 },
      { rowIndex: 0, columnIndex: 5 },
      { clue: "8", rowIndex: 0, columnIndex: 6 },
      { clue: "6", rowIndex: 0, columnIndex: 7 },
      { rowIndex: 0, columnIndex: 8 },
    ];
    expect(s1.getRow(0)).toStrictEqual(r0);

    const r4 = [
      { clue: "7", rowIndex: 4, columnIndex: 0 },
      { clue: "2", rowIndex: 4, columnIndex: 1 },
      { rowIndex: 4, columnIndex: 2 },
      { rowIndex: 4, columnIndex: 3 },
      { rowIndex: 4, columnIndex: 4 },
      { rowIndex: 4, columnIndex: 5 },
      { clue: "4", rowIndex: 4, columnIndex: 6 },
      { rowIndex: 4, columnIndex: 7 },
      { clue: "9", rowIndex: 4, columnIndex: 8 },
    ];
    expect(s1.getRow(4)).toStrictEqual(r4);

    const r8 = [
      { clue: "5", rowIndex: 8, columnIndex: 0 },
      { rowIndex: 8, columnIndex: 1 },
      { clue: "8", rowIndex: 8, columnIndex: 2 },
      { rowIndex: 8, columnIndex: 3 },
      { rowIndex: 8, columnIndex: 4 },
      { rowIndex: 8, columnIndex: 5 },
      { rowIndex: 8, columnIndex: 6 },
      { rowIndex: 8, columnIndex: 7 },
      { clue: "4", rowIndex: 8, columnIndex: 8 },
    ];
    expect(s1.getRow(8)).toStrictEqual(r8);
  });

  it("getColumn", () => {
    const s1 = new Sudoku(testPuzzle1);
    const c0 = [
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { rowIndex: 1, columnIndex: 0 },
      { rowIndex: 2, columnIndex: 0 },
      { clue: "3", rowIndex: 3, columnIndex: 0 },
      { clue: "7", rowIndex: 4, columnIndex: 0 },
      { clue: "8", rowIndex: 5, columnIndex: 0 },
      { rowIndex: 6, columnIndex: 0 },
      { rowIndex: 7, columnIndex: 0 },
      { clue: "5", rowIndex: 8, columnIndex: 0 },
    ];
    expect(s1.getColumn(0)).toStrictEqual(c0);

    const c4 = [
      { rowIndex: 0, columnIndex: 4 },
      { clue: "4", rowIndex: 1, columnIndex: 4 },
      { clue: "6", rowIndex: 2, columnIndex: 4 },
      { clue: "2", rowIndex: 3, columnIndex: 4 },
      { rowIndex: 4, columnIndex: 4 },
      { rowIndex: 5, columnIndex: 4 },
      { clue: "3", rowIndex: 6, columnIndex: 4 },
      { clue: "8", rowIndex: 7, columnIndex: 4 },
      { rowIndex: 8, columnIndex: 4 },
    ];
    expect(s1.getColumn(4)).toStrictEqual(c4);

    const c8 = [
      { rowIndex: 0, columnIndex: 8 },
      { rowIndex: 1, columnIndex: 8 },
      { clue: "7", rowIndex: 2, columnIndex: 8 },
      { clue: "1", rowIndex: 3, columnIndex: 8 },
      { clue: "9", rowIndex: 4, columnIndex: 8 },
      { clue: "6", rowIndex: 5, columnIndex: 8 },
      { rowIndex: 6, columnIndex: 8 },
      { clue: "2", rowIndex: 7, columnIndex: 8 },
      { clue: "4", rowIndex: 8, columnIndex: 8 },
    ];
    expect(s1.getColumn(8)).toStrictEqual(c8);
  });

  it("getBoxFromRowColumnIndex", () => {
    const s = new Sudoku(testPuzzle1);
    const b0 = [
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { rowIndex: 0, columnIndex: 1 },
      { rowIndex: 0, columnIndex: 2 },
      { rowIndex: 1, columnIndex: 0 },
      { rowIndex: 1, columnIndex: 1 },
      { rowIndex: 1, columnIndex: 2 },
      { rowIndex: 2, columnIndex: 0 },
      { clue: "1", rowIndex: 2, columnIndex: 1 },
      { rowIndex: 2, columnIndex: 2 },
    ];
    expect(s.getBoxFromRowColumnIndex(0, 0)).toStrictEqual(b0);
    expect(s.getBoxFromRowColumnIndex(1, 1)).toStrictEqual(b0);
    expect(s.getBoxFromRowColumnIndex(2, 2)).toStrictEqual(b0);

    const b1 = [
      { rowIndex: 0, columnIndex: 3 },
      { rowIndex: 0, columnIndex: 4 },
      { rowIndex: 0, columnIndex: 5 },
      { rowIndex: 1, columnIndex: 3 },
      { clue: "4", rowIndex: 1, columnIndex: 4 },
      { clue: "2", rowIndex: 1, columnIndex: 5 },
      { rowIndex: 2, columnIndex: 3 },
      { clue: "6", rowIndex: 2, columnIndex: 4 },
      { rowIndex: 2, columnIndex: 5 },
    ];
    expect(s.getBoxFromRowColumnIndex(0, 3)).toStrictEqual(b1);
    expect(s.getBoxFromRowColumnIndex(1, 4)).toStrictEqual(b1);
    expect(s.getBoxFromRowColumnIndex(2, 5)).toStrictEqual(b1);

    const b5 = [
      { rowIndex: 3, columnIndex: 6 },
      { rowIndex: 3, columnIndex: 7 },
      { clue: "1", rowIndex: 3, columnIndex: 8 },
      { clue: "4", rowIndex: 4, columnIndex: 6 },
      { rowIndex: 4, columnIndex: 7 },
      { clue: "9", rowIndex: 4, columnIndex: 8 },
      { clue: "5", rowIndex: 5, columnIndex: 6 },
      { rowIndex: 5, columnIndex: 7 },
      { clue: "6", rowIndex: 5, columnIndex: 8 },
    ];
    expect(s.getBoxFromRowColumnIndex(3, 6)).toStrictEqual(b5);
    expect(s.getBoxFromRowColumnIndex(4, 7)).toStrictEqual(b5);
    expect(s.getBoxFromRowColumnIndex(5, 8)).toStrictEqual(b5);

    const b8 = [
      { rowIndex: 6, columnIndex: 6 },
      { rowIndex: 6, columnIndex: 7 },
      { rowIndex: 6, columnIndex: 8 },
      { rowIndex: 7, columnIndex: 6 },
      { clue: "1", rowIndex: 7, columnIndex: 7 },
      { clue: "2", rowIndex: 7, columnIndex: 8 },
      { rowIndex: 8, columnIndex: 6 },
      { rowIndex: 8, columnIndex: 7 },
      { clue: "4", rowIndex: 8, columnIndex: 8 },
    ];
    expect(s.getBoxFromRowColumnIndex(6, 6)).toStrictEqual(b8);
    expect(s.getBoxFromRowColumnIndex(7, 7)).toStrictEqual(b8);
    expect(s.getBoxFromRowColumnIndex(8, 8)).toStrictEqual(b8);
  });

  it("boxFirstLineIndex", () => {
    const s = new Sudoku(testPuzzle1);
    expect(s.boxFirstLineIndex(0, VirtualLineType.ROW)).toBe(0);
    expect(s.boxFirstLineIndex(0, VirtualLineType.COLUMN)).toBe(0);
    expect(s.boxFirstLineIndex(1, VirtualLineType.ROW)).toBe(0);
    expect(s.boxFirstLineIndex(1, VirtualLineType.COLUMN)).toBe(3);
    expect(s.boxFirstLineIndex(2, VirtualLineType.ROW)).toBe(0);
    expect(s.boxFirstLineIndex(2, VirtualLineType.COLUMN)).toBe(6);
    expect(s.boxFirstLineIndex(3, VirtualLineType.ROW)).toBe(3);
    expect(s.boxFirstLineIndex(3, VirtualLineType.COLUMN)).toBe(0);
    expect(s.boxFirstLineIndex(4, VirtualLineType.ROW)).toBe(3);
    expect(s.boxFirstLineIndex(4, VirtualLineType.COLUMN)).toBe(3);
    expect(s.boxFirstLineIndex(5, VirtualLineType.ROW)).toBe(3);
    expect(s.boxFirstLineIndex(5, VirtualLineType.COLUMN)).toBe(6);
    expect(s.boxFirstLineIndex(6, VirtualLineType.ROW)).toBe(6);
    expect(s.boxFirstLineIndex(6, VirtualLineType.COLUMN)).toBe(0);
    expect(s.boxFirstLineIndex(7, VirtualLineType.ROW)).toBe(6);
    expect(s.boxFirstLineIndex(7, VirtualLineType.COLUMN)).toBe(3);
    expect(s.boxFirstLineIndex(8, VirtualLineType.ROW)).toBe(6);
    expect(s.boxFirstLineIndex(8, VirtualLineType.COLUMN)).toBe(6);
  });

  it("getBoxFromBoxIndex", () => {
    const s = new Sudoku(testPuzzle1);
    const t = (ro: number, co: number) => [
      [0 + ro, 0 + co],
      [0 + ro, 1 + co],
      [0 + ro, 2 + co],
      [1 + ro, 0 + co],
      [1 + ro, 1 + co],
      [1 + ro, 2 + co],
      [2 + ro, 0 + co],
      [2 + ro, 1 + co],
      [2 + ro, 2 + co],
    ];
    const b0 = t(0, 0);
    const b1 = t(0, 3);
    const b2 = t(0, 6);
    const b3 = t(3, 0);
    const b4 = t(3, 3);
    const b5 = t(3, 6);
    const b6 = t(6, 0);
    const b7 = t(6, 3);
    const b8 = t(6, 6);

    b0.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(0)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b1.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(1)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b2.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(2)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b3.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(3)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b4.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(4)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b5.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(5)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b6.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(6)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b7.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(7)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
    b8.forEach(([r, c]) => expect(s.getBoxFromBoxIndex(8)).toStrictEqual(s.getBoxFromRowColumnIndex(r, c)));
  });

  it("getAllRows", () => {
    const s = new Sudoku(testPuzzle1);
    const allRows = s.getAllRows();
    const length = 9;
    expect(allRows.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allRows[i]).toStrictEqual(s.getRow(i));
    }
  });

  it("getAllColumns", () => {
    const s = new Sudoku(testPuzzle1);
    const allColumns = s.getAllColumns();
    const length = 9;
    expect(allColumns.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allColumns[i]).toStrictEqual(s.getColumn(i));
    }
  });

  it("getAllBoxes", () => {
    const s = new Sudoku(testPuzzle1);
    const allBoxes = s.getAllBoxes();
    const length = 9;
    expect(allBoxes.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allBoxes[i]).toStrictEqual(s.getBoxFromBoxIndex(i));
    }
  });

  it("missingInVirtualLine", () => {
    const s = new Sudoku(testPuzzle1);

    const r0 = candidatesFactory(false, ["2", "6", "8"]);
    expect(s.missingInVirtualLine(s.getRow(0))).toStrictEqual(r0);

    const r5 = candidatesFactory(false, ["5", "6", "8"]);
    expect(s.missingInVirtualLine(s.getRow(5))).toStrictEqual(r5);

    const r8 = candidatesFactory(false, ["4", "5", "8"]);
    expect(s.missingInVirtualLine(s.getRow(8))).toStrictEqual(r8);

    const c0 = candidatesFactory(true, ["1", "4", "6", "9"]);
    expect(s.missingInVirtualLine(s.getColumn(0))).toStrictEqual(c0);

    const c3 = candidatesFactory(false, ["6"]);
    expect(s.missingInVirtualLine(s.getColumn(3))).toStrictEqual(c3);

    const c8 = candidatesFactory(true, ["3", "5", "8"]);
    expect(s.missingInVirtualLine(s.getColumn(8))).toStrictEqual(c8);

    const b0 = candidatesFactory(false, ["1", "2"]);
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(0))).toStrictEqual(b0);

    const b1 = candidatesFactory(false, ["2", "4", "6"]);
    console.log(s.getBoxFromBoxIndex(1));
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(1))).toStrictEqual(b1);

    const b8 = candidatesFactory(false, ["1", "2", "4"]);
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(8))).toStrictEqual(b8);
  });

  it("missingInVirtualLine", () => {
    const s = new Sudoku(testPuzzle1);

    const r2b = candidatesFactory(false, ["1", "4", "6", "7"]);
    expect(s.missingInVirtualLine(s.getRow(2))).toStrictEqual(r2b);

    const c6b = candidatesFactory(false, ["4", "5", "8"]);
    expect(s.missingInVirtualLine(s.getColumn(6))).toStrictEqual(c6b);

    const b2b = candidatesFactory(false, ["4", "6", "7", "8"]);
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(2))).toStrictEqual(b2b);

    s.setInputValue([{ rowIndex: 2, columnIndex: 6, value: "2" }]);
    const r2a = candidatesFactory(false, ["1", "2", "4", "6", "7"]);
    expect(s.missingInVirtualLine(s.getRow(2))).toStrictEqual(r2a);

    const c6a = candidatesFactory(false, ["2", "4", "5", "8"]);
    expect(s.missingInVirtualLine(s.getColumn(6))).toStrictEqual(c6a);

    const b2a = candidatesFactory(false, ["2", "4", "6", "7", "8"]);
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(2))).toStrictEqual(b2a);
  });
});
