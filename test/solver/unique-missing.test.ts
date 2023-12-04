import { expect, describe, it } from "vitest";
import TestUtil from "../TestUtil";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import { type InputClues, type SudokuElement, VirtualLineType, type Cell } from "../../core/Sudoku/type";
import Sudoku from "../../core/Sudoku/Sudoku";
import UniqueMissing from "../../core/Sudoku/FillStrategy/UniqueMissing";
import { SudokuLine, SudokuLineUtil } from "../../core/Sudoku/SudokuLine";
import { FillStrategyType } from "../../core/Sudoku/FillStrategy/type";
import type { FillInputValueData } from "../../core/Sudoku/FillStrategy/type";

const candidatesFactory = Sudoku.candidatesFactory;

const dataFactory: (cell: Cell, value: SudokuElement, lineType: VirtualLineType, lineIndex: number) => FillInputValueData = (
  cell,
  value,
  lineType,
  lineIndex,
) => ({
  rowIndex: cell.rowIndex,
  columnIndex: cell.columnIndex,
  value,
  relatedLine: SudokuLineUtil.sudokuLine(lineType, lineIndex),
  highlightWholeCell: true,
});

describe("sudoku solver unique missing test", () => {
  it("uniqueCandidate", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);
    expect(UniqueMissing.uniqueCandidate(c1)).toBe("1");
    expect(UniqueMissing.uniqueCandidate(c2)).toBeNull();
    expect(UniqueMissing.uniqueCandidate(c3)).toBeNull();
  });

  it("uniqueMissingFromVirtualLines test 1", () => {
    const line0 = TestUtil.virtualLineFactory([
      { clue: "1" },
      { clue: "2" },
      { clue: "3" },
      { clue: "4" },
      { clue: "5" },
      { clue: "6" },
      { clue: "7" },
      { clue: "8" },
      { clue: "9" },
    ]);
    const line1 = TestUtil.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "3" },
      { clue: "4" },
      { clue: "5" },
      { clue: "6" },
      { clue: "7" },
      { clue: "8" },
      { clue: "9" },
    ]);
    const line2 = TestUtil.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "3" },
      { inputValue: "4" },
      { clue: "5" },
      { clue: "6" },
      { inputValue: "7" },
      { inputValue: "8" },
      { clue: "9" },
    ]);
    const line3 = TestUtil.virtualLineFactory([
      { clue: "1" },
      ["2"],
      { clue: "3" },
      { inputValue: "4" },
      { clue: "5" },
      { clue: "6" },
      { inputValue: "7" },
      { inputValue: "8" },
      { clue: "9" },
    ]);
    const line4 = TestUtil.virtualLineFactory([
      { clue: "1" },
      undefined,
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
      { clue: "1" },
    ]);

    const lines = [line0, line1, line2, line3, line4];

    const expectedResult: FillInputValueData[] = [
      {
        rowIndex: line1[1].rowIndex,
        columnIndex: line1[1].columnIndex,
        value: "2",
        relatedLine: SudokuLine.ROW_1,
        highlightWholeCell: true,
      },
      {
        rowIndex: line2[1].rowIndex,
        columnIndex: line2[1].columnIndex,
        value: "2",
        relatedLine: SudokuLine.ROW_2,
        highlightWholeCell: true,
      },
      {
        rowIndex: line3[1].rowIndex,
        columnIndex: line3[1].columnIndex,
        value: "2",
        relatedLine: SudokuLine.ROW_3,
        highlightWholeCell: true,
      },
    ];

    expect(UniqueMissing.uniqueMissingInVirtualLines(lines, VirtualLineType.ROW)).toStrictEqual(expectedResult);
  });

  it("uniqueMissingFromVirtualLines test 2", () => {
    const fn = UniqueMissing.uniqueMissingInVirtualLines;

    const clue: InputClues = [
      ["2", "9", "0", "4", "6", "7", "5", "3", "8"],
      ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
      ["6", "0", "8", "0", "0", "0", "4", "0", "9"],
      ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
      ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
      ["4", "3", "7", "6", "5", "0", "8", "0", "1"],
      ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
      ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
      ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
    ];
    const s = new SudokuSolver(new Sudoku(clue));
    expect(fn(s.getSudoku().getAllRows(), VirtualLineType.ROW)).toStrictEqual([dataFactory(s.getSudoku().getRow(0)[2], "1", VirtualLineType.ROW, 0)]);
    expect(fn(s.getSudoku().getAllColumns(), VirtualLineType.COLUMN)).toStrictEqual([
      dataFactory(s.getSudoku().getColumn(0)[8], "3", VirtualLineType.COLUMN, 0),
    ]);
    expect(fn(s.getSudoku().getAllBoxes(), VirtualLineType.BOX)).toStrictEqual([
      dataFactory(s.getSudoku().getBoxFromBoxIndex(3)[5], "5", VirtualLineType.BOX, 3),
    ]);
  });

  it("fillUniqueMissing overall", () => {
    const fn = UniqueMissing.uniqueMissingInVirtualLines;

    const clue: InputClues = [
      ["2", "9", "1", "4", "6", "7", "5", "3", "8"],
      ["7", "4", "3", "8", "9", "5", "1", "6", "2"],
      ["6", "5", "8", "2", "3", "1", "4", "7", "9"],
      ["9", "6", "2", "1", "7", "8", "3", "4", "5"],
      ["8", "1", "5", "9", "4", "3", "7", "2", "6"],
      ["4", "3", "7", "6", "5", "2", "8", "9", "1"],
      ["5", "8", "6", "7", "2", "4", "9", "1", "3"],
      ["1", "7", "9", "3", "8", "6", "2", "5", "4"],
      ["3", "2", "4", "5", "1", "9", "6", "8", "0"],
    ];

    const s = new SudokuSolver(new Sudoku(clue));
    expect(fn(s.getSudoku().getAllRows(), VirtualLineType.ROW)).toStrictEqual([dataFactory(s.getSudoku().getRow(8)[8], "7", VirtualLineType.ROW, 8)]);
    expect(fn(s.getSudoku().getAllColumns(), VirtualLineType.COLUMN)).toStrictEqual([
      dataFactory(s.getSudoku().getColumn(8)[8], "7", VirtualLineType.COLUMN, 8),
    ]);
    expect(fn(s.getSudoku().getAllBoxes(), VirtualLineType.BOX)).toStrictEqual([
      dataFactory(s.getSudoku().getBoxFromBoxIndex(8)[8], "7", VirtualLineType.BOX, 8),
    ]);

    // check remove duplicated
    expect(UniqueMissing.uniqueMissing(s.getSudoku())).toStrictEqual([dataFactory(s.getSudoku().getRow(8)[8], "7", VirtualLineType.ROW, 8)]);

    expect(s.setValueFromFillStrategy(FillStrategyType.UNIQUE_MISSING)).toBe(1);
    expect(s.getSudoku().isValid).toBe(true);
    expect(s.getSudoku().solved).toBe(true);
    expect(s.setValueFromFillStrategy(FillStrategyType.UNIQUE_MISSING)).toBe(0);
  });
});
