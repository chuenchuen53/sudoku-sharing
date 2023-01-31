import { expect, describe, it, vitest, beforeAll } from "vitest";
import ArrUtil from "../src/utils/ArrUtil";
import Sudoku from "../src/Sudoku/Sudoku";
import { VirtualLineType } from "../src/Sudoku/type";
import TU from "./utils";
import type { CellWithIndex, InputClues, CheckVirtualLineDuplicateResult } from "../src/Sudoku/type";

const candidatesFactory = Sudoku.candidatesFactory;

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

const p0Solution: InputClues = [
  ["2", "9", "1", "4", "6", "7", "5", "3", "8"],
  ["7", "4", "3", "8", "9", "5", "1", "6", "2"],
  ["6", "5", "8", "2", "3", "1", "4", "7", "9"],
  ["9", "6", "2", "1", "7", "8", "3", "4", "5"],
  ["8", "1", "5", "9", "4", "3", "7", "2", "6"],
  ["4", "3", "7", "6", "5", "2", "8", "9", "1"],
  ["5", "8", "6", "7", "2", "4", "9", "1", "3"],
  ["1", "7", "9", "3", "8", "6", "2", "5", "4"],
  ["3", "2", "4", "5", "1", "9", "6", "8", "7"],
];

// medium
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
    vitest.spyOn(console, "error").mockImplementation(() => {
      return;
    });
  });

  it("createGrid throw error", () => {
    const ic = JSON.parse(JSON.stringify(p0)).push(["0", "0", "0", "0", "0", "0", "0", "0", "0"]);
    expect(() => new Sudoku(ic)).toThrow();
  });

  it("createGrid 1", () => {
    const sudoku = new Sudoku(p1);
    const gridExpected = [
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
    expect(sudoku.grid).toStrictEqual(gridExpected);
  });

  it("createGrid 2", () => {
    const sudoku = new Sudoku(p2);
    const gridExpected = [
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
    expect(sudoku.grid).toStrictEqual(gridExpected);
  });

  it("validatePuzzle", () => {
    const invalidClues1: InputClues = ArrUtil.cloneArr(p1);
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
    const s1 = new Sudoku(p1);
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
    const invalidClues1: InputClues = ArrUtil.cloneArr(p1);

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
    const s1 = new Sudoku(p1);
    s1.setInputValue({ rowIndex: 0, columnIndex: 0, value: "2" }, true);
    expect(console.error).toHaveBeenCalled();
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(p1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "9"), false);
    expect(s1.grid[2][0].inputValue).toBe("9");
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(p1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "9"), true);
    expect(s1.grid[2][0].inputValue).toBe("9");
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(p1);
    s1.setInputValue(TU.inputValueDataFactory(2, 0, "1"), false);
    expect(s1.grid[2][0].inputValue).toBe("1");
    expect(s1.isValid).toBe(true);
  });

  it("setInputValue", () => {
    const s1 = new Sudoku(p1);
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
    const s = new Sudoku(p1);
    s.setInputValues([TU.inputValueDataFactory(2, 0, "9"), TU.inputValueDataFactory(2, 2, "3")]);
    expect(s.grid[2][0].inputValue).toBe("9");
    expect(s.grid[2][2].inputValue).toBe("3");
    expect(s.isValid).toBe(true);
  });

  it("setInputValues", () => {
    const s = new Sudoku(p1);

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

  it("removeInputValue", () => {
    const s = new Sudoku(p0);
    s.setInputValue({ rowIndex: 0, columnIndex: 0, value: "9" }, true);
    expect(s.isValid).toBe(false);
    s.removeInputValue({ rowIndex: 0, columnIndex: 0 }, false);
    expect(s.isValid).toBe(false);
  });

  it("removeInputValue", () => {
    const s = new Sudoku(p0);
    s.setInputValue({ rowIndex: 0, columnIndex: 0, value: "9" }, true);
    expect(s.isValid).toBe(false);
    s.removeInputValue({ rowIndex: 0, columnIndex: 0 }, true);
    expect(s.isValid).toBe(true);
  });

  it("numberOfClues", () => {
    const noc = (i: InputClues) => i.flat(1).reduce((acc, cur) => (cur !== "0" ? acc + 1 : acc), 0);
    expect(new Sudoku(p1).numberOfClues).toBe(noc(p1));
    expect(new Sudoku(p2).numberOfClues).toBe(noc(p2));
  });

  it("getRow", () => {
    const s1 = new Sudoku(p1);

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
    const s1 = new Sudoku(p1);
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
    const s = new Sudoku(p1);
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
    expect(Sudoku.boxFirstLineIndex(0, VirtualLineType.ROW)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(0, VirtualLineType.COLUMN)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(1, VirtualLineType.ROW)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(1, VirtualLineType.COLUMN)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(2, VirtualLineType.ROW)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(2, VirtualLineType.COLUMN)).toBe(6);
    expect(Sudoku.boxFirstLineIndex(3, VirtualLineType.ROW)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(3, VirtualLineType.COLUMN)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(4, VirtualLineType.ROW)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(4, VirtualLineType.COLUMN)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(5, VirtualLineType.ROW)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(5, VirtualLineType.COLUMN)).toBe(6);
    expect(Sudoku.boxFirstLineIndex(6, VirtualLineType.ROW)).toBe(6);
    expect(Sudoku.boxFirstLineIndex(6, VirtualLineType.COLUMN)).toBe(0);
    expect(Sudoku.boxFirstLineIndex(7, VirtualLineType.ROW)).toBe(6);
    expect(Sudoku.boxFirstLineIndex(7, VirtualLineType.COLUMN)).toBe(3);
    expect(Sudoku.boxFirstLineIndex(8, VirtualLineType.ROW)).toBe(6);
    expect(Sudoku.boxFirstLineIndex(8, VirtualLineType.COLUMN)).toBe(6);
  });

  it("getBoxFromBoxIndex", () => {
    const s = new Sudoku(p1);
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
    const s = new Sudoku(p1);
    const allRows = s.getAllRows();
    const length = 9;
    expect(allRows.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allRows[i]).toStrictEqual(s.getRow(i));
    }
  });

  it("getAllColumns", () => {
    const s = new Sudoku(p1);
    const allColumns = s.getAllColumns();
    const length = 9;
    expect(allColumns.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allColumns[i]).toStrictEqual(s.getColumn(i));
    }
  });

  it("getAllBoxes", () => {
    const s = new Sudoku(p1);
    const allBoxes = s.getAllBoxes();
    const length = 9;
    expect(allBoxes.length).toBe(length);
    for (let i = 0; i < length; i++) {
      expect(allBoxes[i]).toStrictEqual(s.getBoxFromBoxIndex(i));
    }
  });

  it("getAllVirtualLine", () => {
    const s = new Sudoku(p1);
    expect(s.getAllVirtualLines(VirtualLineType.ROW)).toStrictEqual(s.getAllRows());
    expect(s.getAllVirtualLines(VirtualLineType.COLUMN)).toStrictEqual(s.getAllColumns());
    expect(s.getAllVirtualLines(VirtualLineType.BOX)).toStrictEqual(s.getAllBoxes());
  });

  it("getAllRelatedBoxesInRowOrColumn", () => {
    const s = new Sudoku(p1);
    const r0 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 0);
    const r1 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 1);
    const r2 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 2);
    const r3 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 3);
    const r4 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 4);
    const r5 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 5);
    const r6 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 6);
    const r7 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 7);
    const r8 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.ROW, 8);

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

  it("getAllRelatedBoxesInRowOrColumn", () => {
    const s = new Sudoku(p1);
    const c0 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 0);
    const c1 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 1);
    const c2 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 2);
    const c3 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 3);
    const c4 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 4);
    const c5 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 5);
    const c6 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 6);
    const c7 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 7);
    const c8 = s.getAllRelatedBoxesInRowOrColumn(VirtualLineType.COLUMN, 8);

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

  it("getAllRelatedRowsOrColumnsInBox", () => {
    const s = new Sudoku(p1);
    const b0 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 0);
    const b1 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 1);
    const b2 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 2);
    const b3 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 3);
    const b4 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 4);
    const b5 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 5);
    const b6 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 6);
    const b7 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 7);
    const b8 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.ROW, 8);

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

  it("getAllRelatedRowsOrColumnsInBox", () => {
    const s = new Sudoku(p1);
    const b0 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 0);
    const b1 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 1);
    const b2 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 2);
    const b3 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 3);
    const b4 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 4);
    const b5 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 5);
    const b6 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 6);
    const b7 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 7);
    const b8 = s.getAllRelatedRowsOrColumnsInBox(VirtualLineType.COLUMN, 8);

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

  it("virtualLinesIntersections", () => {
    const s = new Sudoku(p1);
    const r0 = s.getRow(0);
    const r5 = s.getRow(5);
    const c0 = s.getColumn(0);
    const c5 = s.getColumn(5);
    const b0 = s.getBoxFromBoxIndex(0);
    const b5 = s.getBoxFromBoxIndex(5);

    expect(Sudoku.virtualLinesIntersections(r0, r0)).toStrictEqual(r0);
    expect(Sudoku.virtualLinesIntersections(c0, c0)).toStrictEqual(c0);
    expect(Sudoku.virtualLinesIntersections(b0, b0)).toStrictEqual(b0);

    expect(Sudoku.virtualLinesIntersections(r0, r5)).toStrictEqual([]);
    expect(Sudoku.virtualLinesIntersections(c0, c5)).toStrictEqual([]);
    expect(Sudoku.virtualLinesIntersections(b0, b5)).toStrictEqual([]);

    const c = (rowIndex: number, columnIndex: number) => ({ ...s.grid[rowIndex][columnIndex], rowIndex, columnIndex });

    const r0c0 = [c(0, 0)];
    const r0c5 = [c(0, 5)];
    const r5c0 = [c(5, 0)];
    const r5c5 = [c(5, 5)];
    expect(Sudoku.virtualLinesIntersections(r0, c0)).toStrictEqual(r0c0);
    expect(Sudoku.virtualLinesIntersections(r0, c5)).toStrictEqual(r0c5);
    expect(Sudoku.virtualLinesIntersections(r5, c0)).toStrictEqual(r5c0);
    expect(Sudoku.virtualLinesIntersections(r5, c5)).toStrictEqual(r5c5);
    expect(Sudoku.virtualLinesIntersections(r0, c0)).toStrictEqual(Sudoku.virtualLinesIntersections(c0, r0));
    expect(Sudoku.virtualLinesIntersections(r0, c5)).toStrictEqual(Sudoku.virtualLinesIntersections(c5, r0));
    expect(Sudoku.virtualLinesIntersections(r5, c0)).toStrictEqual(Sudoku.virtualLinesIntersections(c0, r5));
    expect(Sudoku.virtualLinesIntersections(r5, c5)).toStrictEqual(Sudoku.virtualLinesIntersections(c5, r5));

    const r0b0 = [c(0, 0), c(0, 1), c(0, 2)];
    const r0b5: CellWithIndex[] = [];
    const r5b0: CellWithIndex[] = [];
    const r5b5 = [c(5, 6), c(5, 7), c(5, 8)];
    expect(Sudoku.virtualLinesIntersections(r0, b0)).toStrictEqual(r0b0);
    expect(Sudoku.virtualLinesIntersections(r0, b5)).toStrictEqual(r0b5);
    expect(Sudoku.virtualLinesIntersections(r5, b0)).toStrictEqual(r5b0);
    expect(Sudoku.virtualLinesIntersections(r5, b5)).toStrictEqual(r5b5);
    expect(Sudoku.virtualLinesIntersections(r0, b0)).toStrictEqual(Sudoku.virtualLinesIntersections(b0, r0));
    expect(Sudoku.virtualLinesIntersections(r0, b5)).toStrictEqual(Sudoku.virtualLinesIntersections(b5, r0));
    expect(Sudoku.virtualLinesIntersections(r5, b0)).toStrictEqual(Sudoku.virtualLinesIntersections(b0, r5));
    expect(Sudoku.virtualLinesIntersections(r5, b5)).toStrictEqual(Sudoku.virtualLinesIntersections(b5, r5));

    const c0b0 = [c(0, 0), c(1, 0), c(2, 0)];
    const c0b5: CellWithIndex[] = [];
    const c5b0: CellWithIndex[] = [];
    const c5b5: CellWithIndex[] = [];
    expect(Sudoku.virtualLinesIntersections(c0, b0)).toStrictEqual(c0b0);
    expect(Sudoku.virtualLinesIntersections(c0, b5)).toStrictEqual(c0b5);
    expect(Sudoku.virtualLinesIntersections(c5, b0)).toStrictEqual(c5b0);
    expect(Sudoku.virtualLinesIntersections(c5, b5)).toStrictEqual(c5b5);
    expect(Sudoku.virtualLinesIntersections(c0, b0)).toStrictEqual(Sudoku.virtualLinesIntersections(b0, c0));
    expect(Sudoku.virtualLinesIntersections(c0, b5)).toStrictEqual(Sudoku.virtualLinesIntersections(b5, c0));
    expect(Sudoku.virtualLinesIntersections(c5, b0)).toStrictEqual(Sudoku.virtualLinesIntersections(b0, c5));
    expect(Sudoku.virtualLinesIntersections(c5, b5)).toStrictEqual(Sudoku.virtualLinesIntersections(b5, c5));
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
    const s = new Sudoku(p1);

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

    expect(Sudoku.removeDuplicatedInputValueData([input1, input2])).toStrictEqual([input1]);
    expect(Sudoku.removeDuplicatedInputValueData([input1, input2, input1, input1])).toStrictEqual([input1]);
    expect(Sudoku.removeDuplicatedInputValueData([input1, input3])).toStrictEqual([input1, input3]);
    expect(Sudoku.removeDuplicatedInputValueData([input3, input4])).toStrictEqual([input3, input4]);
    expect(Sudoku.removeDuplicatedInputValueData([input1, input2, input3, input4])).toStrictEqual([
      input1,
      input3,
      input4,
    ]);
  });

  it("missingInVirtualLine", () => {
    const s = new Sudoku(p1);

    const r0 = candidatesFactory(false, ["2", "6", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getRow(0))).toStrictEqual(r0);

    const r5 = candidatesFactory(false, ["5", "6", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getRow(5))).toStrictEqual(r5);

    const r8 = candidatesFactory(false, ["4", "5", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getRow(8))).toStrictEqual(r8);

    const c0 = candidatesFactory(true, ["1", "4", "6", "9"]);
    expect(Sudoku.missingInVirtualLine(s.getColumn(0))).toStrictEqual(c0);

    const c3 = candidatesFactory(false, ["6"]);
    expect(Sudoku.missingInVirtualLine(s.getColumn(3))).toStrictEqual(c3);

    const c8 = candidatesFactory(true, ["3", "5", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getColumn(8))).toStrictEqual(c8);

    const b0 = candidatesFactory(false, ["1", "2"]);
    expect(Sudoku.missingInVirtualLine(s.getBoxFromBoxIndex(0))).toStrictEqual(b0);

    const b1 = candidatesFactory(false, ["2", "4", "6"]);
    expect(Sudoku.missingInVirtualLine(s.getBoxFromBoxIndex(1))).toStrictEqual(b1);

    const b8 = candidatesFactory(false, ["1", "2", "4"]);
    expect(Sudoku.missingInVirtualLine(s.getBoxFromBoxIndex(8))).toStrictEqual(b8);
  });

  it("missingInVirtualLine", () => {
    const s = new Sudoku(p1);

    const r2b = candidatesFactory(false, ["1", "4", "6", "7"]);
    expect(Sudoku.missingInVirtualLine(s.getRow(2))).toStrictEqual(r2b);

    const c6b = candidatesFactory(false, ["4", "5", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getColumn(6))).toStrictEqual(c6b);

    const b2b = candidatesFactory(false, ["4", "6", "7", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getBoxFromBoxIndex(2))).toStrictEqual(b2b);

    s.setInputValue({ rowIndex: 2, columnIndex: 6, value: "2" }, true);
    const r2a = candidatesFactory(false, ["1", "2", "4", "6", "7"]);
    expect(Sudoku.missingInVirtualLine(s.getRow(2))).toStrictEqual(r2a);

    const c6a = candidatesFactory(false, ["2", "4", "5", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getColumn(6))).toStrictEqual(c6a);

    const b2a = candidatesFactory(false, ["2", "4", "6", "7", "8"]);
    expect(Sudoku.missingInVirtualLine(s.getBoxFromBoxIndex(2))).toStrictEqual(b2a);
  });

  it("clearAllCandidates", () => {
    const s = new Sudoku(p0);
    s.setCandidates(0, 0, candidatesFactory(true, ["2", "3"]));
    expect(s.grid.some((x) => x.some((y) => y.candidates))).toBe(true);
    s.clearAllCandidates();
    expect(s.grid.some((x) => x.some((y) => y.candidates))).toBe(false);
  });

  it("solved", () => {
    const s = new Sudoku(p0);
    expect(s.solved).toBe(false);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (p0[r][c] === "0") {
          const value = p0Solution[r][c];
          if (value === "0") throw new Error("testPuzzle0Solution has a 0");
          s.setInputValue({ rowIndex: r, columnIndex: c, value }, true);
        }
      }
    }

    expect(s.solved).toBe(true);
  });

  it("candidatesCount", () => {
    const c1 = candidatesFactory(true, ["1", "2", "3"]);
    const c2 = candidatesFactory(true, ["1", "2", "3", "4"]);
    const c3 = candidatesFactory(true, ["2", "5"]);

    expect(Sudoku.candidatesCount(c1)).toBe(3);
    expect(Sudoku.candidatesCount(c2)).toBe(4);
    expect(Sudoku.candidatesCount(c3)).toBe(2);
  });

  it("getRowColumnIndexFromBoxIndexAndCellIndex", () => {
    const fn = Sudoku.getRowColumnIndexFromBoxIndexAndCellIndex;
    const rcf = (rowIndex: number, columnIndex: number) => ({ rowIndex, columnIndex });

    expect(fn(0, 0)).toStrictEqual(rcf(0, 0));
    expect(fn(0, 1)).toStrictEqual(rcf(0, 1));
    expect(fn(0, 2)).toStrictEqual(rcf(0, 2));
    expect(fn(0, 3)).toStrictEqual(rcf(1, 0));
    expect(fn(0, 4)).toStrictEqual(rcf(1, 1));
    expect(fn(0, 5)).toStrictEqual(rcf(1, 2));
    expect(fn(0, 6)).toStrictEqual(rcf(2, 0));
    expect(fn(0, 7)).toStrictEqual(rcf(2, 1));
    expect(fn(0, 8)).toStrictEqual(rcf(2, 2));

    expect(fn(1, 0)).toStrictEqual(rcf(0, 3));
    expect(fn(1, 1)).toStrictEqual(rcf(0, 4));
    expect(fn(1, 2)).toStrictEqual(rcf(0, 5));
    expect(fn(1, 3)).toStrictEqual(rcf(1, 3));
    expect(fn(1, 4)).toStrictEqual(rcf(1, 4));
    expect(fn(1, 5)).toStrictEqual(rcf(1, 5));
    expect(fn(1, 6)).toStrictEqual(rcf(2, 3));
    expect(fn(1, 7)).toStrictEqual(rcf(2, 4));
    expect(fn(1, 8)).toStrictEqual(rcf(2, 5));

    expect(fn(2, 0)).toStrictEqual(rcf(0, 6));
    expect(fn(2, 1)).toStrictEqual(rcf(0, 7));
    expect(fn(2, 2)).toStrictEqual(rcf(0, 8));
    expect(fn(2, 3)).toStrictEqual(rcf(1, 6));
    expect(fn(2, 4)).toStrictEqual(rcf(1, 7));
    expect(fn(2, 5)).toStrictEqual(rcf(1, 8));
    expect(fn(2, 6)).toStrictEqual(rcf(2, 6));
    expect(fn(2, 7)).toStrictEqual(rcf(2, 7));
    expect(fn(2, 8)).toStrictEqual(rcf(2, 8));

    expect(fn(3, 0)).toStrictEqual(rcf(3, 0));
    expect(fn(3, 1)).toStrictEqual(rcf(3, 1));
    expect(fn(3, 2)).toStrictEqual(rcf(3, 2));
    expect(fn(3, 3)).toStrictEqual(rcf(4, 0));
    expect(fn(3, 4)).toStrictEqual(rcf(4, 1));
    expect(fn(3, 5)).toStrictEqual(rcf(4, 2));
    expect(fn(3, 6)).toStrictEqual(rcf(5, 0));
    expect(fn(3, 7)).toStrictEqual(rcf(5, 1));
    expect(fn(3, 8)).toStrictEqual(rcf(5, 2));

    expect(fn(4, 0)).toStrictEqual(rcf(3, 3));
    expect(fn(4, 1)).toStrictEqual(rcf(3, 4));
    expect(fn(4, 2)).toStrictEqual(rcf(3, 5));
    expect(fn(4, 3)).toStrictEqual(rcf(4, 3));
    expect(fn(4, 4)).toStrictEqual(rcf(4, 4));
    expect(fn(4, 5)).toStrictEqual(rcf(4, 5));
    expect(fn(4, 6)).toStrictEqual(rcf(5, 3));
    expect(fn(4, 7)).toStrictEqual(rcf(5, 4));
    expect(fn(4, 8)).toStrictEqual(rcf(5, 5));

    expect(fn(5, 0)).toStrictEqual(rcf(3, 6));
    expect(fn(5, 1)).toStrictEqual(rcf(3, 7));
    expect(fn(5, 2)).toStrictEqual(rcf(3, 8));
    expect(fn(5, 3)).toStrictEqual(rcf(4, 6));
    expect(fn(5, 4)).toStrictEqual(rcf(4, 7));
    expect(fn(5, 5)).toStrictEqual(rcf(4, 8));
    expect(fn(5, 6)).toStrictEqual(rcf(5, 6));
    expect(fn(5, 7)).toStrictEqual(rcf(5, 7));
    expect(fn(5, 8)).toStrictEqual(rcf(5, 8));

    expect(fn(6, 0)).toStrictEqual(rcf(6, 0));
    expect(fn(6, 1)).toStrictEqual(rcf(6, 1));
    expect(fn(6, 2)).toStrictEqual(rcf(6, 2));
    expect(fn(6, 3)).toStrictEqual(rcf(7, 0));
    expect(fn(6, 4)).toStrictEqual(rcf(7, 1));
    expect(fn(6, 5)).toStrictEqual(rcf(7, 2));
    expect(fn(6, 6)).toStrictEqual(rcf(8, 0));
    expect(fn(6, 7)).toStrictEqual(rcf(8, 1));
    expect(fn(6, 8)).toStrictEqual(rcf(8, 2));

    expect(fn(7, 0)).toStrictEqual(rcf(6, 3));
    expect(fn(7, 1)).toStrictEqual(rcf(6, 4));
    expect(fn(7, 2)).toStrictEqual(rcf(6, 5));
    expect(fn(7, 3)).toStrictEqual(rcf(7, 3));
    expect(fn(7, 4)).toStrictEqual(rcf(7, 4));
    expect(fn(7, 5)).toStrictEqual(rcf(7, 5));
    expect(fn(7, 6)).toStrictEqual(rcf(8, 3));
    expect(fn(7, 7)).toStrictEqual(rcf(8, 4));
    expect(fn(7, 8)).toStrictEqual(rcf(8, 5));

    expect(fn(8, 0)).toStrictEqual(rcf(6, 6));
    expect(fn(8, 1)).toStrictEqual(rcf(6, 7));
    expect(fn(8, 2)).toStrictEqual(rcf(6, 8));
    expect(fn(8, 3)).toStrictEqual(rcf(7, 6));
    expect(fn(8, 4)).toStrictEqual(rcf(7, 7));
    expect(fn(8, 5)).toStrictEqual(rcf(7, 8));
    expect(fn(8, 6)).toStrictEqual(rcf(8, 6));
    expect(fn(8, 7)).toStrictEqual(rcf(8, 7));
    expect(fn(8, 8)).toStrictEqual(rcf(8, 8));
  });

  it("addElementInCandidates", () => {
    const s0 = new Sudoku(p0);

    const input = TU.inputValueDataArrFactory([
      [0, 0, "1"],
      [0, 0, "2"],
      [0, 0, "3"],
    ]);
    expect(s0.addElementInCandidates(input)).toBe(3);
    expect(s0.grid[0][0].candidates).toStrictEqual(Sudoku.candidatesFactory(true, ["1", "2", "3"]));

    expect(s0.addElementInCandidates(input)).toBe(0);
  });

  it("removeElementInCandidates", () => {
    const s0 = new Sudoku(p0);

    const input = TU.inputValueDataArrFactory([
      [0, 0, "1"],
      [0, 0, "2"],
      [0, 0, "3"],
    ]);

    const remove = TU.inputValueDataArrFactory([
      [0, 0, "1"],
      [0, 0, "3"],
      [0, 0, "4"],
      [0, 0, "5"],
      [0, 0, "6"],
      [0, 0, "7"],
      [0, 0, "8"],
      [0, 0, "9"],
    ]);

    s0.addElementInCandidates(input);
    expect(s0.removeElementInCandidates(remove)).toBe(2);
    expect(s0.grid[0][0].candidates).toStrictEqual(Sudoku.candidatesFactory(true, ["2"]));

    expect(s0.removeElementInCandidates(input)).toBe(1);
    expect(s0.grid[0][0].candidates).toStrictEqual(Sudoku.candidatesFactory(false));
  });
});
