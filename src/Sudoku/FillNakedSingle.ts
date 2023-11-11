import FillStrategy, { type FillInputValueData } from "./FillStrategy";
import type Sudoku from "./Sudoku";
import SudokuSolver from "./SudokuSolver";
import type { Cell, Grid } from "./type";

export default class FillNakedSingle extends FillStrategy {
  canFill(sudoku: Sudoku): FillInputValueData[] {
    return FillNakedSingle.nakedSingles(sudoku);
  }

  static loopGrid(grid: Grid, fn: (rowIndex: number, columnIndex: number, cell: Cell, row?: Cell[]) => void): void {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const cell = row[columnIndex];
        fn(rowIndex, columnIndex, cell, row);
      }
    }
  }

  static nakedSingles(sudoku: Sudoku): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    FillNakedSingle.loopGrid(sudoku.grid, (rowIndex, columnIndex, cell) => {
      if (!cell.candidates) return;
      const candidatesArr = SudokuSolver.getCandidatesArr(cell.candidates);
      if (candidatesArr.length === 1) result.push({ rowIndex, columnIndex, value: candidatesArr[0] });
    });
    return result;
  }
}
