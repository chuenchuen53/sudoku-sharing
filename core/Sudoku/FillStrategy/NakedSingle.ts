import SudokuSolver from "../SudokuSolver";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";
import type Sudoku from "../Sudoku";
import type { Candidates, Cell, Grid } from "../type";

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

  public static nakedSingles(sudoku: Sudoku): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    NakedSingle.loopGrid(sudoku.grid, (rowIndex, columnIndex, cell) => {
      if (!cell.candidates) return;
      const candidatesArr = SudokuSolver.getCandidatesArr(cell.candidates);
      if (candidatesArr.length === 1) result.push({ rowIndex, columnIndex, value: candidatesArr[0] });
    });
    return result;
  }

  public static nakedSingleWithOverrideCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    NakedSingle.loopGrid(sudoku.grid, (rowIndex, columnIndex, cell) => {
      if (cell.clue || cell.inputValue) return;
      const candidates = overrideCandidates[rowIndex][columnIndex];
      if (!candidates) return;
      const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
      if (candidatesArr.length === 1) result.push({ rowIndex, columnIndex, value: candidatesArr[0] });
    });
    return result;
  }

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { rowIndex, columnIndex, value } = data;

    return `Naked Single: ${value} in r${rowIndex + 1}c${columnIndex + 1}`;
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return NakedSingle.nakedSingles(sudoku);
  }
}
