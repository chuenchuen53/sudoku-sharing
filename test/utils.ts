import { candidatesFactory } from "../src/Sudoku/Sudoku";
import { InputClues, InputValueData, SudokuElement, VirtualLine } from "../src/Sudoku/type";
import ArrayUtils from "../src/utils/ArrayUtil";

export default class TU {
  static emptyPuzzle = (): InputClues => ArrayUtils.create2DArray(9, 9, "0");

  static inputValueDataFactory = (r: number, c: number, v: SudokuElement): InputValueData => {
    return {
      rowIndex: r,
      columnIndex: c,
      value: v,
    };
  };

  static candidatesLineFactory = (candidates: (SudokuElement[] | undefined)[]): VirtualLine => {
    return candidates.map((candidates, index) => {
      return {
        candidates: candidates ? candidatesFactory(true, candidates) : undefined,
        rowIndex: 0,
        columnIndex: index,
      };
    });
  };
}
