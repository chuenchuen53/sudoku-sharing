import { expect, describe, it, vitest, beforeAll } from "vitest";
import ArrayUtils from "../src/utils/ArrayUtil";
import Sudoku, { CheckVirtualLineDuplicateResult, candidatesFactory } from "../src/Sudoku";
import {
  Candidates,
  CellWithIndex,
  InputClues,
  VirtualLineType,
  SudokuElement,
  InputValueData,
} from "../src/sudoku/type";
import TU from "./utils";

export const testPuzzle0: InputClues = [
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

const validateDetailTemplate: () => Record<VirtualLineType, CheckVirtualLineDuplicateResult[]> = () => {
  const t = () =>
    Array(9)
      .fill(null)
      .map((_) => ({ haveDuplicate: false, duplicatedCells: [] as CellWithIndex[] }));
  return {
    [VirtualLineType.ROW]: t(),
    [VirtualLineType.COLUMN]: t(),
    [VirtualLineType.BOX]: t(),
  };
};

describe("sudoku basic", () => {
  beforeAll(() => {
    vitest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("createPuzzle", () => {
    const ic = JSON.parse(JSON.stringify(testPuzzle0)).push(["0", "0", "0", "0", "0", "0", "0", "0", "0"]);
    expect(() => new Sudoku(ic)).toThrow();
  });

  it("createPuzzle", () => {
    const sudoku = new Sudoku(TU.emptyPuzzle());
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
    s1DetailExpected[VirtualLineType.ROW][0].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.ROW][0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { clue: "2", rowIndex: 0, columnIndex: 1 }
    );
    s1DetailExpected[VirtualLineType.COLUMN][1].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.COLUMN][1].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 1 },
      { clue: "2", rowIndex: 4, columnIndex: 1 }
    );
    s1DetailExpected[VirtualLineType.BOX][0].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.BOX][0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { clue: "2", rowIndex: 0, columnIndex: 1 }
    );
    const s1Expected = {
      isValid: false,
      validateDetail: s1DetailExpected,
    };

    expect(s1.validatePuzzle("clue")).toStrictEqual(s1Expected);
  });

  it("validatePuzzle", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue({ rowIndex: 0, columnIndex: 1, value: "2" }, true);
    const s1DetailExpected = validateDetailTemplate();
    s1DetailExpected[VirtualLineType.ROW][0].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.ROW][0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { inputValue: "2", rowIndex: 0, columnIndex: 1 }
    );
    s1DetailExpected[VirtualLineType.COLUMN][1].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.COLUMN][1].duplicatedCells.push(
      { inputValue: "2", rowIndex: 0, columnIndex: 1 },
      { clue: "2", rowIndex: 4, columnIndex: 1 }
    );
    s1DetailExpected[VirtualLineType.BOX][0].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.BOX][0].duplicatedCells.push(
      { clue: "2", rowIndex: 0, columnIndex: 0 },
      { inputValue: "2", rowIndex: 0, columnIndex: 1 }
    );
    const s1Expected = {
      isValid: false,
      validateDetail: s1DetailExpected,
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
    s1DetailExpected[VirtualLineType.ROW][2].haveDuplicate = true;
    s1DetailExpected[VirtualLineType.ROW][2].duplicatedCells.push(
      { clue: "6", rowIndex: 2, columnIndex: 0 },
      { clue: "1", rowIndex: 2, columnIndex: 1 },
      { clue: "1", rowIndex: 2, columnIndex: 3 },
      { clue: "6", rowIndex: 2, columnIndex: 4 },
      { clue: "1", rowIndex: 2, columnIndex: 6 }
    );
    const s1Expected = {
      isValid: false,
      validateDetail: s1DetailExpected,
    };

    expect(s1.validatePuzzle("clue")).toStrictEqual(s1Expected);
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue({ rowIndex: 0, columnIndex: 0, value: "2" }, true);
    expect(console.error).toHaveBeenCalled();
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "9"), false);
    expect(s1.grid[2][0].inputValue).toBe("9");
    expect(s1.elementMissing.ROW[2]["9"]).toBe(true);
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "9"), true);
    expect(s1.grid[2][0].inputValue).toBe("9");
    expect(s1.elementMissing.ROW[2]["9"]).toBe(false);
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "1"), false);
    expect(s1.grid[2][0].inputValue).toBe("1");
    expect(s1.isValid).toBe(true);
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(testPuzzle1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "1"), true);

    const expectedDetail = [
      {
        rowIndex: 2,
        columnIndex: 0,
        inputValue: "1",
      },
      {
        clue: "1",
        columnIndex: 1,
        rowIndex: 2,
      },
    ];

    expect(s1.grid[2][0].inputValue).toBe("1");
    expect(s1.isValid).toBe(false);
    expect(s1.validateDetail[VirtualLineType.ROW][2].haveDuplicate).toBe(true);
    expect(s1.validateDetail[VirtualLineType.ROW][2].duplicatedCells).toStrictEqual(expectedDetail);
    expect(s1.validateDetail[VirtualLineType.BOX][0].haveDuplicate).toBe(true);
    expect(s1.validateDetail[VirtualLineType.BOX][0].duplicatedCells).toStrictEqual(expectedDetail);
  });

  it("setInputValues", () => {
    const s = new Sudoku(testPuzzle1);
    s.setInputValues([TU.inputValueDataFactory(2, 0, "9"), TU.inputValueDataFactory(2, 2, "3")]);
    expect(s.grid[2][0].inputValue).toBe("9");
    expect(s.grid[2][2].inputValue).toBe("3");
    expect(s.isValid).toBe(true);
  });

  it("setInputValues", () => {
    const s = new Sudoku(testPuzzle1);

    const expectedDetail = [
      {
        rowIndex: 2,
        columnIndex: 0,
        inputValue: "1",
      },
      {
        clue: "1",
        columnIndex: 1,
        rowIndex: 2,
      },
    ];

    s.setInputValues([TU.inputValueDataFactory(2, 0, "1"), TU.inputValueDataFactory(2, 2, "3")]);
    expect(s.grid[2][0].inputValue).toBe("1");
    expect(s.grid[2][2].inputValue).toBe("3");
    expect(s.isValid).toBe(false);
    expect(s.validateDetail[VirtualLineType.ROW][2].haveDuplicate).toBe(true);
    expect(s.validateDetail[VirtualLineType.ROW][2].duplicatedCells).toStrictEqual(expectedDetail);
    expect(s.validateDetail[VirtualLineType.BOX][0].haveDuplicate).toBe(true);
    expect(s.validateDetail[VirtualLineType.BOX][0].duplicatedCells).toStrictEqual(expectedDetail);
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

  it("getAllVirtualLine", () => {
    const s = new Sudoku(testPuzzle1);
    expect(s.getAllVirtualLines(VirtualLineType.ROW)).toStrictEqual(s.getAllRows());
    expect(s.getAllVirtualLines(VirtualLineType.COLUMN)).toStrictEqual(s.getAllColumns());
    expect(s.getAllVirtualLines(VirtualLineType.BOX)).toStrictEqual(s.getAllBoxes());
  });

  it("getAllRelatedBoxesInLine", () => {
    const s = new Sudoku(testPuzzle1);
    const r0 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 0);
    const r1 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 1);
    const r2 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 2);
    const r3 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 3);
    const r4 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 4);
    const r5 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 5);
    const r6 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 6);
    const r7 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 7);
    const r8 = s.getAllRelatedBoxesInLine(VirtualLineType.ROW, 8);

    const allBoxes = s.getAllBoxes();
    const b012 = allBoxes.slice(0, 3);
    const b345 = allBoxes.slice(3, 6);
    const b678 = allBoxes.slice(6, 9);
    expect(r0).toStrictEqual(b012);
    expect(r1).toStrictEqual(b012);
    expect(r2).toStrictEqual(b012);
    expect(r3).toStrictEqual(b345);
    expect(r4).toStrictEqual(b345);
    expect(r5).toStrictEqual(b345);
    expect(r6).toStrictEqual(b678);
    expect(r7).toStrictEqual(b678);
    expect(r8).toStrictEqual(b678);
  });

  it("getAllRelatedBoxesInLine", () => {
    const s = new Sudoku(testPuzzle1);
    const c0 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 0);
    const c1 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 1);
    const c2 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 2);
    const c3 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 3);
    const c4 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 4);
    const c5 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 5);
    const c6 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 6);
    const c7 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 7);
    const c8 = s.getAllRelatedBoxesInLine(VirtualLineType.COLUMN, 8);

    const allBoxes = s.getAllBoxes();
    const b036 = [allBoxes[0], allBoxes[3], allBoxes[6]];
    const b345 = [allBoxes[1], allBoxes[4], allBoxes[7]];
    const b678 = [allBoxes[2], allBoxes[5], allBoxes[8]];
    expect(c0).toStrictEqual(b036);
    expect(c1).toStrictEqual(b036);
    expect(c2).toStrictEqual(b036);
    expect(c3).toStrictEqual(b345);
    expect(c4).toStrictEqual(b345);
    expect(c5).toStrictEqual(b345);
    expect(c6).toStrictEqual(b678);
    expect(c7).toStrictEqual(b678);
    expect(c8).toStrictEqual(b678);
  });

  it("getAllRelatedLinesInBox", () => {
    const s = new Sudoku(testPuzzle1);
    const b0 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 0);
    const b1 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 1);
    const b2 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 2);
    const b3 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 3);
    const b4 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 4);
    const b5 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 5);
    const b6 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 6);
    const b7 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 7);
    const b8 = s.getAllRelatedLinesInBox(VirtualLineType.ROW, 8);

    const allRows = s.getAllRows();
    const r012 = allRows.slice(0, 3);
    const r345 = allRows.slice(3, 6);
    const r678 = allRows.slice(6, 9);
    expect(b0).toStrictEqual(r012);
    expect(b1).toStrictEqual(r012);
    expect(b2).toStrictEqual(r012);
    expect(b3).toStrictEqual(r345);
    expect(b4).toStrictEqual(r345);
    expect(b5).toStrictEqual(r345);
    expect(b6).toStrictEqual(r678);
    expect(b7).toStrictEqual(r678);
    expect(b8).toStrictEqual(r678);
  });

  it("getAllRelatedLinesInBox", () => {
    const s = new Sudoku(testPuzzle1);
    const b0 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 0);
    const b1 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 1);
    const b2 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 2);
    const b3 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 3);
    const b4 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 4);
    const b5 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 5);
    const b6 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 6);
    const b7 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 7);
    const b8 = s.getAllRelatedLinesInBox(VirtualLineType.COLUMN, 8);

    const allColumns = s.getAllColumns();
    const c012 = allColumns.slice(0, 3);
    const c345 = allColumns.slice(3, 6);
    const c678 = allColumns.slice(6, 9);
    expect(b0).toStrictEqual(c012);
    expect(b1).toStrictEqual(c345);
    expect(b2).toStrictEqual(c678);
    expect(b3).toStrictEqual(c012);
    expect(b4).toStrictEqual(c345);
    expect(b5).toStrictEqual(c678);
    expect(b6).toStrictEqual(c012);
    expect(b7).toStrictEqual(c345);
    expect(b8).toStrictEqual(c678);
  });

  it("getVirtualLinesIntersections", () => {
    const s = new Sudoku(testPuzzle1);
    const r0 = s.getRow(0);
    const r5 = s.getRow(5);
    const c0 = s.getColumn(0);
    const c5 = s.getColumn(5);
    const b0 = s.getBoxFromBoxIndex(0);
    const b5 = s.getBoxFromBoxIndex(5);

    expect(s.getVirtualLinesIntersections(r0, r0)).toStrictEqual(r0);
    expect(s.getVirtualLinesIntersections(c0, c0)).toStrictEqual(c0);
    expect(s.getVirtualLinesIntersections(b0, b0)).toStrictEqual(b0);

    expect(s.getVirtualLinesIntersections(r0, r5)).toStrictEqual([]);
    expect(s.getVirtualLinesIntersections(c0, c5)).toStrictEqual([]);
    expect(s.getVirtualLinesIntersections(b0, b5)).toStrictEqual([]);

    const c = (rowIndex: number, columnIndex: number) => ({ ...s.grid[rowIndex][columnIndex], rowIndex, columnIndex });

    const r0c0 = [c(0, 0)];
    const r0c5 = [c(0, 5)];
    const r5c0 = [c(5, 0)];
    const r5c5 = [c(5, 5)];
    expect(s.getVirtualLinesIntersections(r0, c0)).toStrictEqual(r0c0);
    expect(s.getVirtualLinesIntersections(r0, c5)).toStrictEqual(r0c5);
    expect(s.getVirtualLinesIntersections(r5, c0)).toStrictEqual(r5c0);
    expect(s.getVirtualLinesIntersections(r5, c5)).toStrictEqual(r5c5);
    expect(s.getVirtualLinesIntersections(r0, c0)).toStrictEqual(s.getVirtualLinesIntersections(c0, r0));
    expect(s.getVirtualLinesIntersections(r0, c5)).toStrictEqual(s.getVirtualLinesIntersections(c5, r0));
    expect(s.getVirtualLinesIntersections(r5, c0)).toStrictEqual(s.getVirtualLinesIntersections(c0, r5));
    expect(s.getVirtualLinesIntersections(r5, c5)).toStrictEqual(s.getVirtualLinesIntersections(c5, r5));

    const r0b0 = [c(0, 0), c(0, 1), c(0, 2)];
    const r0b5 = [];
    const r5b0 = [];
    const r5b5 = [c(5, 6), c(5, 7), c(5, 8)];
    expect(s.getVirtualLinesIntersections(r0, b0)).toStrictEqual(r0b0);
    expect(s.getVirtualLinesIntersections(r0, b5)).toStrictEqual(r0b5);
    expect(s.getVirtualLinesIntersections(r5, b0)).toStrictEqual(r5b0);
    expect(s.getVirtualLinesIntersections(r5, b5)).toStrictEqual(r5b5);
    expect(s.getVirtualLinesIntersections(r0, b0)).toStrictEqual(s.getVirtualLinesIntersections(b0, r0));
    expect(s.getVirtualLinesIntersections(r0, b5)).toStrictEqual(s.getVirtualLinesIntersections(b5, r0));
    expect(s.getVirtualLinesIntersections(r5, b0)).toStrictEqual(s.getVirtualLinesIntersections(b0, r5));
    expect(s.getVirtualLinesIntersections(r5, b5)).toStrictEqual(s.getVirtualLinesIntersections(b5, r5));

    const c0b0 = [c(0, 0), c(1, 0), c(2, 0)];
    const c0b5 = [];
    const c5b0 = [];
    const c5b5 = [];
    expect(s.getVirtualLinesIntersections(c0, b0)).toStrictEqual(c0b0);
    expect(s.getVirtualLinesIntersections(c0, b5)).toStrictEqual(c0b5);
    expect(s.getVirtualLinesIntersections(c5, b0)).toStrictEqual(c5b0);
    expect(s.getVirtualLinesIntersections(c5, b5)).toStrictEqual(c5b5);
    expect(s.getVirtualLinesIntersections(c0, b0)).toStrictEqual(s.getVirtualLinesIntersections(b0, c0));
    expect(s.getVirtualLinesIntersections(c0, b5)).toStrictEqual(s.getVirtualLinesIntersections(b5, c0));
    expect(s.getVirtualLinesIntersections(c5, b0)).toStrictEqual(s.getVirtualLinesIntersections(b0, c5));
    expect(s.getVirtualLinesIntersections(c5, b5)).toStrictEqual(s.getVirtualLinesIntersections(b5, c5));
  });

  it("isSamePos", () => {
    const p1 = { rowIndex: 0, columnIndex: 0, clue: "1" } as const;
    const p2 = { rowIndex: 0, columnIndex: 0, candidate: candidatesFactory(true) } as const;
    const p3 = { rowIndex: 5, columnIndex: 7, inputValue: "3" } as const;
    const p4 = { rowIndex: 5, columnIndex: 7, clue: "1" } as const;

    expect(Sudoku.isSamePos(p1, p2)).toBe(true);
    expect(Sudoku.isSamePos(p2, p1)).toBe(true);
    expect(Sudoku.isSamePos(p1, p3)).toBe(false);
    expect(Sudoku.isSamePos(p1, p4)).toBe(false);
    expect(Sudoku.isSamePos(p3, p4)).toBe(true);
    expect(Sudoku.isSamePos(p4, p3)).toBe(true);
    expect(Sudoku.isSamePos(p3, p1)).toBe(false);
  });

  it("getAllRelatedCells", () => {
    const s = new Sudoku(testPuzzle1);

    const c = (rowIndex: number, columnIndex: number) => ({ ...s.grid[rowIndex][columnIndex], rowIndex, columnIndex });
    const c34 = c(3, 4);
    const allRelatedCells = [
      // row
      c(3, 0),
      c(3, 1),
      c(3, 2),
      c(3, 3),
      // c(3, 4), // self
      c(3, 5),
      c(3, 6),
      c(3, 7),
      c(3, 8),
      // column
      c(0, 4),
      c(1, 4),
      c(2, 4),
      // c(3, 4), // self
      c(4, 4),
      c(5, 4),
      c(6, 4),
      c(7, 4),
      c(8, 4),
      // box
      // c(3, 3), // row repeated
      // c(3, 4), // self
      // c(3, 5), // row repeated
      c(4, 3),
      // c(4, 4), // column repeated
      c(4, 5),
      c(5, 3),
      // c(5, 4), // column repeated
      c(5, 5),
    ];
    expect(s.getAllRelatedCells(c34)).toStrictEqual(allRelatedCells);

    const c77 = c(7, 6);
    const allRelatedCells2 = [
      // row
      c(7, 0),
      c(7, 1),
      c(7, 2),
      c(7, 3),
      c(7, 4),
      c(7, 5),
      // c(7, 6), // self
      c(7, 7),
      c(7, 8),
      // column
      c(0, 6),
      c(1, 6),
      c(2, 6),
      c(3, 6),
      c(4, 6),
      c(5, 6),
      c(6, 6),
      // c(7, 6), // self
      c(8, 6),
      // box
      // c(6, 6), // column repeated
      c(6, 7),
      c(6, 8),
      // c(7, 6), // self
      // c(7, 7), // row repeated
      // c(7, 8), // row repeated
      // c(8, 6), // column repeated
      c(8, 7),
      c(8, 8),
    ];
    expect(s.getAllRelatedCells(c77)).toStrictEqual(allRelatedCells2);
  });

  it("removeDuplicatesInputValueData", () => {
    const input1 = { rowIndex: 1, columnIndex: 2, value: "1" } as const;
    const input2 = { rowIndex: 1, columnIndex: 2, value: "1" } as const;
    const input3 = { rowIndex: 3, columnIndex: 6, value: "3" } as const;
    const input4 = { rowIndex: 3, columnIndex: 6, value: "4" } as const;

    expect(Sudoku.removeDuplicatesInputValueData([input1, input2])).toStrictEqual([input1]);
    expect(Sudoku.removeDuplicatesInputValueData([input1, input2, input1, input1])).toStrictEqual([input1]);
    expect(Sudoku.removeDuplicatesInputValueData([input1, input3])).toStrictEqual([input1, input3]);
    expect(Sudoku.removeDuplicatesInputValueData([input3, input4])).toStrictEqual([input3, input4]);
    expect(Sudoku.removeDuplicatesInputValueData([input1, input2, input3, input4])).toStrictEqual([
      input1,
      input3,
      input4,
    ]);
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

    s.setInputValue({ rowIndex: 2, columnIndex: 6, value: "2" }, true);
    const r2a = candidatesFactory(false, ["1", "2", "4", "6", "7"]);
    expect(s.missingInVirtualLine(s.getRow(2))).toStrictEqual(r2a);

    const c6a = candidatesFactory(false, ["2", "4", "5", "8"]);
    expect(s.missingInVirtualLine(s.getColumn(6))).toStrictEqual(c6a);

    const b2a = candidatesFactory(false, ["2", "4", "6", "7", "8"]);
    expect(s.missingInVirtualLine(s.getBoxFromBoxIndex(2))).toStrictEqual(b2a);
  });

  it("getCombinedMissing", () => {
    const s = new Sudoku(testPuzzle0);
    s.getCombinedMissing();

    const arr: [number, number, Candidates][] = [
      [0, 0, candidatesFactory(true, ["2", "3"])],
      [0, 2, candidatesFactory(true, ["1", "3"])],
      [0, 7, candidatesFactory(true, ["3"])],
      [1, 1, candidatesFactory(true, ["4", "5"])],
      [1, 2, candidatesFactory(true, ["1", "3", "5", "6"])],
      [1, 3, candidatesFactory(true, ["2", "5", "8", "9"])],
      [1, 4, candidatesFactory(true, ["1", "2", "3", "8", "9"])],
      [1, 5, candidatesFactory(true, ["1", "2", "5", "8"])],
      [1, 6, candidatesFactory(true, ["1", "2", "3"])],
      [1, 7, candidatesFactory(true, ["3", "6"])],
      [1, 8, candidatesFactory(true, ["2", "6"])],
      [2, 0, candidatesFactory(true, ["2", "3", "6"])],
      [2, 1, candidatesFactory(true, ["5"])],
      [2, 3, candidatesFactory(true, ["2", "5"])],
      [2, 4, candidatesFactory(true, ["1", "2", "3"])],
      [2, 5, candidatesFactory(true, ["1", "2", "5"])],
      [2, 7, candidatesFactory(true, ["3", "6", "7"])],
      [3, 4, candidatesFactory(true, ["7", "8"])],
      [3, 5, candidatesFactory(true, ["8"])],
      [3, 6, candidatesFactory(true, ["3", "7"])],
      [3, 8, candidatesFactory(true, ["5", "7"])],
      [4, 2, candidatesFactory(true, ["5"])],
      [4, 3, candidatesFactory(true, ["9"])],
      [4, 4, candidatesFactory(true, ["4", "7", "9"])],
      [4, 6, candidatesFactory(true, ["7"])],
      [4, 8, candidatesFactory(true, ["5", "6", "7"])],
      [5, 0, candidatesFactory(true, ["4"])],
      [5, 5, candidatesFactory(true, ["2"])],
      [5, 7, candidatesFactory(true, ["9"])],
      [6, 2, candidatesFactory(true, ["6"])],
      [6, 4, candidatesFactory(true, ["2"])],
      [7, 1, candidatesFactory(true, ["7"])],
      [7, 2, candidatesFactory(true, ["6", "9"])],
      [7, 4, candidatesFactory(true, ["2", "8"])],
      [7, 5, candidatesFactory(true, ["2", "5", "6", "8"])],
      [7, 6, candidatesFactory(true, ["2", "7"])],
      [7, 7, candidatesFactory(true, ["5", "7", "8"])],
      [7, 8, candidatesFactory(true, ["2", "4", "5", "7"])],
      [8, 0, candidatesFactory(true, ["3"])],
      [8, 3, candidatesFactory(true, ["5", "8"])],
      [8, 4, candidatesFactory(true, ["1", "8"])],
      [8, 7, candidatesFactory(true, ["5", "7", "8"])],
      [8, 8, candidatesFactory(true, ["5", "7"])],
    ];

    arr.forEach(([r, c, candidates]) => expect(s.grid[r][c].candidates).toStrictEqual(candidates));

    const ns = new Sudoku(testPuzzle0);
    arr.forEach(([r, c, candidates]) => ns.setCandidates(r, c, candidates));
    expect(ns.grid).toStrictEqual(s.grid);
  });

  it("getCombinedMissing", () => {
    const s = new Sudoku(testPuzzle1);
    s.getCombinedMissing();

    const arr: [number, number, Candidates][] = [
      [0, 1, candidatesFactory(true, ["3", "5", "7", "9"])],
      [0, 2, candidatesFactory(true, ["3", "4", "7", "9"])],
      [0, 3, candidatesFactory(true, ["1", "3", "5", "7", "9"])],
      [0, 4, candidatesFactory(true, ["1", "5", "7", "9"])],
      [0, 5, candidatesFactory(true, ["1", "3", "5", "7", "9"])],
      [0, 8, candidatesFactory(true, ["3", "5"])],
      [1, 0, candidatesFactory(true, ["6", "9"])],
      [1, 1, candidatesFactory(true, ["3", "5", "6", "7", "8", "9"])],
      [1, 2, candidatesFactory(true, ["3", "6", "7", "9"])],
      [1, 3, candidatesFactory(true, ["1", "3", "5", "7", "8", "9"])],
      [1, 6, candidatesFactory(true, ["1", "3", "9"])],
      [1, 7, candidatesFactory(true, ["3", "5", "9"])],
      [1, 8, candidatesFactory(true, ["3", "5"])],
      [2, 0, candidatesFactory(true, ["9"])],
      [2, 2, candidatesFactory(true, ["3", "9"])],
      [2, 3, candidatesFactory(true, ["3", "5", "8", "9"])],
      [2, 5, candidatesFactory(true, ["3", "5", "8", "9"])],
      [2, 6, candidatesFactory(true, ["2", "3", "9"])],
      [3, 3, candidatesFactory(true, ["7", "8", "9"])],
      [3, 5, candidatesFactory(true, ["6", "7", "8", "9"])],
      [3, 6, candidatesFactory(true, ["7"])],
      [3, 7, candidatesFactory(true, ["7", "8"])],
      [4, 2, candidatesFactory(true, ["1", "6"])],
      [4, 3, candidatesFactory(true, ["1", "3", "5", "8"])],
      [4, 4, candidatesFactory(true, ["1", "5"])],
      [4, 5, candidatesFactory(true, ["1", "3", "5", "6", "8"])],
      [4, 7, candidatesFactory(true, ["3", "8"])],
      [5, 1, candidatesFactory(true, ["9"])],
      [5, 2, candidatesFactory(true, ["1", "9"])],
      [5, 3, candidatesFactory(true, ["1", "3", "4", "7", "9"])],
      [5, 4, candidatesFactory(true, ["1", "7", "9"])],
      [5, 5, candidatesFactory(true, ["1", "3", "4", "7", "9"])],
      [5, 7, candidatesFactory(true, ["2", "3", "7"])],
      [6, 0, candidatesFactory(true, ["1", "4", "6", "9"])],
      [6, 1, candidatesFactory(true, ["6", "7", "9"])],
      [6, 3, candidatesFactory(true, ["1", "4", "5", "7", "9"])],
      [6, 5, candidatesFactory(true, ["1", "4", "5", "7", "9"])],
      [6, 6, candidatesFactory(true, ["6", "7", "9"])],
      [6, 7, candidatesFactory(true, ["5", "7", "8", "9"])],
      [6, 8, candidatesFactory(true, ["5", "8"])],
      [7, 0, candidatesFactory(true, ["4", "9"])],
      [7, 1, candidatesFactory(true, ["3", "7", "9"])],
      [7, 2, candidatesFactory(true, ["3", "4", "7", "9"])],
      [7, 5, candidatesFactory(true, ["4", "5", "7", "9"])],
      [7, 6, candidatesFactory(true, ["3", "7", "9"])],
      [8, 1, candidatesFactory(true, ["3", "6", "7", "9"])],
      [8, 3, candidatesFactory(true, ["1", "2", "7", "9"])],
      [8, 4, candidatesFactory(true, ["1", "7", "9"])],
      [8, 5, candidatesFactory(true, ["1", "7", "9"])],
      [8, 6, candidatesFactory(true, ["3", "6", "7", "9"])],
      [8, 7, candidatesFactory(true, ["3", "7", "9"])],
    ];

    arr.forEach(([r, c, candidates]) => expect(s.grid[r][c].candidates).toStrictEqual(candidates));

    const ns = new Sudoku(testPuzzle1);
    arr.forEach(([r, c, candidates]) => ns.setCandidates(r, c, candidates));
    expect(ns.grid).toStrictEqual(s.grid);
  });

  it("clearAllCandidates", () => {
    const s = new Sudoku(testPuzzle0);
    s.getCombinedMissing();
    expect(s.grid.some((x) => x.some((y) => y.candidates))).toBe(true);
    s.clearAllCandidates();
    expect(s.grid.some((x) => x.some((y) => y.candidates))).toBe(false);
  });
});
