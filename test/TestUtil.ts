import Sudoku from "../src/Sudoku/Sudoku";
import { VirtualLineType } from "../src/Sudoku/type";
import ArrUtil from "../src/utils/ArrUtil";
import type { Pincer, Cell, InputClues, InputValueData, SudokuElement, VirtualLine } from "../src/Sudoku/type";
import type { FillInputValueData, RelatedLine } from "@/Sudoku/FillStrategy";

export default class TestUtil {
  static emptyPuzzle = (): InputClues => ArrUtil.create2DArray(9, 9, () => "0");

  static inputValueDataFactory = (r: number, c: number, v: SudokuElement): InputValueData => {
    return {
      rowIndex: r,
      columnIndex: c,
      value: v,
    };
  };

  static inputValueDataArrFactory = (arr: [number, number, SudokuElement][]): InputValueData[] => {
    return arr.map(([r, c, v]) => TestUtil.inputValueDataFactory(r, c, v));
  };

  static fillInputValueDataFactory = (
    r: number,
    c: number,
    v: SudokuElement,
    virtualLineType: VirtualLineType,
    lineIndex: number
  ): FillInputValueData => {
    return {
      rowIndex: r,
      columnIndex: c,
      value: v,
      relatedLine: {
        virtualLineType,
        lineIndex,
      },
    };
  };

  static fillInputValueDataArrFactory = (arr: [number, number, SudokuElement, VirtualLineType, number][]): FillInputValueData[] => {
    return arr.map(([r, c, v, virtualLineType, lineIndex]) => TestUtil.fillInputValueDataFactory(r, c, v, virtualLineType, lineIndex));
  };

  static removeDuplicate2DArray = (arr: [number, number, SudokuElement][]): [number, number, SudokuElement][] => {
    return arr.filter(([r, c, v], index) => arr.findIndex(([r2, c2, v2]) => r === r2 && c === c2 && v === v2) === index);
  };

  static CellFactory = (
    rowIndex: number,
    columnIndex: number,
    option: {
      clue?: SudokuElement;
      inputValue?: SudokuElement;
      candidates?: SudokuElement[];
    }
  ): Cell => {
    const c: Cell = {
      rowIndex,
      columnIndex,
    };

    if (option.clue) c.clue = option.clue;
    if (option.inputValue) c.inputValue = option.inputValue;
    if (option.candidates) c.candidates = Sudoku.candidatesFactory(true, option.candidates);

    return c;
  };

  static pincerFactory(cell: Cell, same: SudokuElement, diff: SudokuElement): Pincer {
    return {
      ...cell,
      same,
      diff,
    };
  }

  static virtualLineFactory = (
    cellInfo: (SudokuElement[] | { clue: SudokuElement } | { inputValue: SudokuElement } | undefined)[],
    option:
      | {
          type: VirtualLineType.ROW | VirtualLineType.COLUMN;
          lineIndex: number;
        }
      | {
          type: VirtualLineType.BOX;
          boxIndex: number;
        } = { type: VirtualLineType.ROW, lineIndex: 0 }
  ): VirtualLine => {
    function getRowColumnIndex(x: number): { rowIndex: number; columnIndex: number } {
      switch (option.type) {
        case VirtualLineType.ROW:
          return { rowIndex: option.lineIndex, columnIndex: x };
        case VirtualLineType.COLUMN:
          return { rowIndex: x, columnIndex: option.lineIndex };
        case VirtualLineType.BOX: {
          const boxIndex = option.boxIndex;
          return Sudoku.getRowColumnIndexFromBoxIndexAndCellIndex(boxIndex, x);
        }
      }
    }

    return cellInfo.map((info, index) => {
      const obj: Cell = getRowColumnIndex(index);

      if (!info) return obj;

      if (Array.isArray(info)) {
        obj.candidates = Sudoku.candidatesFactory(true, info);
      } else if ("clue" in info) {
        obj.clue = info.clue;
      } else if ("inputValue" in info) {
        obj.inputValue = info.inputValue;
      }

      return obj;
    });
  };
}
