import type { SudokuLine } from "../SudokuLine";
import type { PositionAndValue, Position } from "../type";
import type Sudoku from "../Sudoku";
import type { Elimination } from "../EliminationStrategy/EliminationStrategy";

export enum FillStrategyType {
  UNIQUE_MISSING = "UNIQUE_MISSING",
  NAKED_SINGLE = "NAKED_SINGLE",
  HIDDEN_SINGLE = "HIDDEN_SINGLE",
}

export interface FillInputValueData extends PositionAndValue {
  relatedLine?: SudokuLine;
  highlightWholeCell?: boolean;
  mainRelatedLine?: SudokuLine;
  secondaryRelatedLines?: SudokuLine[];
  secondaryHighlight?: Position[];
}

export default abstract class FillStrategy {
  public static strategyName(strategy: FillStrategyType): string {
    return strategy.toLowerCase().replaceAll("_", " ");
  }

  public static eliminationAfterFill(sudoku: Sudoku, data: FillInputValueData[]): { eliminations: Elimination[]; removals: PositionAndValue[] } {
    const eliminations: Elimination[] = [];
    const removals: PositionAndValue[] = [];
    for (const { rowIndex, columnIndex, value } of data) {
      const relatedCells = sudoku.getAllRelatedCells({ rowIndex, columnIndex });
      relatedCells.forEach(({ rowIndex, columnIndex, candidates }) => {
        if (!candidates?.[value]) return;
        const currentElimination = eliminations.find((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex);
        if (currentElimination) {
          currentElimination.elements.push(value);
        } else {
          eliminations.push({ rowIndex, columnIndex, elements: [value] });
        }
      });
    }
    for (const x of eliminations) {
      for (const value of x.elements) {
        removals.push({ rowIndex: x.rowIndex, columnIndex: x.columnIndex, value });
      }
    }

    return { removals, eliminations };
  }

  public abstract canFill(sudoku: Sudoku): FillInputValueData[];

  public abstract descriptionOfFillInputValueData(data: FillInputValueData): string;
}
