import type { Position } from "../core/Sudoku/type";

export default class SudokuInputUtil {
  private constructor() {}

  public static indexCap(idx: number): number {
    return Math.min(8, Math.max(0, idx));
  }

  public static newSelectedPosition(rowChange: number, colChange: number, curPosition: Position): { rowIndex: number; columnIndex: number } {
    return {
      rowIndex: SudokuInputUtil.indexCap(curPosition.rowIndex + rowChange),
      columnIndex: SudokuInputUtil.indexCap(curPosition.columnIndex + colChange),
    };
  }
}
