import SudokuSolver from "../SudokuSolver";
import Sudoku from "../Sudoku";
import { VirtualLineType } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import FillStrategy from "./FillStrategy";
import type { Candidates, Cell, Grid } from "../type";
import type { FillInputValueData } from "./type";

export default class NakedSingle extends FillStrategy {
  private static readonly instance = new NakedSingle();

  private constructor() {
    super();
  }

  public static getInstance(): NakedSingle {
    return NakedSingle.instance;
  }

  public static loopGrid(grid: Grid, fn: (rowIndex: number, columnIndex: number, cell: Cell, row?: Cell[]) => void): void {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const row = grid[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const cell = row[columnIndex];
        fn(rowIndex, columnIndex, cell, row);
      }
    }
  }

  public static nakedSingles(grid: Grid, overrideCandidates?: (Candidates | undefined)[][]): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    NakedSingle.loopGrid(grid, (rowIndex, columnIndex, cell) => {
      const candidates = overrideCandidates ? overrideCandidates[rowIndex][columnIndex] : cell.candidates;
      if (!candidates) return;
      const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
      if (candidatesArr.length !== 1) return;
      if (overrideCandidates) {
        const relatedRow = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, rowIndex);
        const relatedColumn = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, columnIndex);
        const relatedBox = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, Sudoku.getBoxIndex(rowIndex, columnIndex));
        const secondaryRelatedLines = [relatedRow, relatedColumn, relatedBox];
        result.push({ rowIndex, columnIndex, value: candidatesArr[0], highlightWholeCell: true, secondaryRelatedLines });
      } else {
        result.push({ rowIndex, columnIndex, value: candidatesArr[0] });
      }
    });
    return result;
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return NakedSingle.nakedSingles(sudoku.getGrid());
  }

  public override canFillWithoutCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[] {
    return NakedSingle.nakedSingles(sudoku.getGrid(), overrideCandidates);
  }

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { rowIndex, columnIndex, value } = data;
    return `${value} in R${rowIndex + 1}C${columnIndex + 1}`;
  }
}
