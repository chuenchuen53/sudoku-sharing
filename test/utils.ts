import Sudoku from "../src/Sudoku/Sudoku";
import { VirtualLineType } from "../src/Sudoku/type";
import ArrUtil from "../src/utils/ArrUtil";
import type { Pincer, CellWithIndex, InputClues, InputValueData, SudokuElement, VirtualLine } from "../src/Sudoku/type";

export default class TU {
  static emptyPuzzle = (): InputClues => ArrUtil.create2DArray(9, 9, "0");

  static inputValueDataFactory = (r: number, c: number, v: SudokuElement): InputValueData => {
    return {
      rowIndex: r,
      columnIndex: c,
      value: v,
    };
  };

  static inputValueDataArrFactory = (arr: [number, number, SudokuElement][]): InputValueData[] => {
    return arr.map(([r, c, v]) => TU.inputValueDataFactory(r, c, v));
  };

  static removeDuplicate2DArray = (arr: [number, number, SudokuElement][]): [number, number, SudokuElement][] => {
    return arr.filter(
      ([r, c, v], index) => arr.findIndex(([r2, c2, v2]) => r === r2 && c === c2 && v === v2) === index
    );
  };

  static cellWithIndexFactory = (
    rowIndex: number,
    columnIndex: number,
    option: {
      clue?: SudokuElement;
      inputValue?: SudokuElement;
      candidates?: SudokuElement[];
    }
  ): CellWithIndex => {
    const c: CellWithIndex = {
      rowIndex,
      columnIndex,
    };

    if (option.clue) c.clue = option.clue;
    if (option.inputValue) c.inputValue = option.inputValue;
    if (option.candidates) c.candidates = Sudoku.candidatesFactory(true, option.candidates);

    return c;
  };

  static pincerFactory(cell: CellWithIndex, same: SudokuElement, diff: SudokuElement): Pincer {
    return {
      ...cell,
      same,
      diff,
    };
  }

  static candidatesLineFactory = (
    candidates: (SudokuElement[] | undefined)[],
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
    if (option.type === VirtualLineType.BOX) {
      const boxIndex = option.boxIndex;
      const rowIndex = Math.floor(boxIndex / 3) * 3;
      const columnIndex = (boxIndex % 3) * 3;
      return candidates.map((candidates, index) => ({
        candidates: candidates ? Sudoku.candidatesFactory(true, candidates) : undefined,
        rowIndex: rowIndex + Math.floor(index / 3),
        columnIndex: columnIndex + (index % 3),
      }));
    }

    return candidates.map((candidates, index) => ({
      candidates: candidates ? Sudoku.candidatesFactory(true, candidates) : undefined,
      rowIndex: option.type === VirtualLineType.ROW ? option.lineIndex : index,
      columnIndex: option.type === VirtualLineType.COLUMN ? option.lineIndex : index,
    }));
  };
}
