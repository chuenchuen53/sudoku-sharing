import Sudoku from "../src/Sudoku/Sudoku";
import { InputClues, InputValueData, SudokuElement, VirtualLine, VirtualLineType } from "../src/Sudoku/type";
import ArrUtil from "../src/utils/ArrUtil";

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

  static candidatesLineFactory = (
    candidates: (SudokuElement[] | undefined)[],
    option?: {
      type: VirtualLineType.ROW | VirtualLineType.COLUMN;
      lineIndex: number;
    }
  ): VirtualLine => {
    option = option ?? { type: VirtualLineType.ROW, lineIndex: 0 };
    return candidates.map((candidates, index) => ({
      candidates: candidates ? Sudoku.candidatesFactory(true, candidates) : undefined,
      rowIndex: option.type === VirtualLineType.ROW ? option.lineIndex : index,
      columnIndex: option.type === VirtualLineType.COLUMN ? option.lineIndex : index,
    }));
  };
}
