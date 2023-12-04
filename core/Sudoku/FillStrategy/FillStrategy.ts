import Sudoku from "../Sudoku";
import type { SudokuLine } from "../SudokuLine";
import type { PositionAndValue, Position, Candidates, FillStep } from "../type";
import type { Elimination } from "../EliminationStrategy/EliminationStrategy";

export enum FillStrategyType {
  UNIQUE_MISSING = "UNIQUE_MISSING",
  NAKED_SINGLE = "NAKED_SINGLE",
  HIDDEN_SINGLE = "HIDDEN_SINGLE",
}

export interface FillInputValueData extends PositionAndValue {
  relatedLine?: SudokuLine;
  highlightWholeCell?: boolean;
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
      for (const relatedCell of relatedCells) {
        const { rowIndex, columnIndex, candidates } = relatedCell;
        if (!candidates?.[value]) continue;
        const currentElimination = eliminations.find((x) => Sudoku.isSamePos(x, relatedCell));
        if (currentElimination) {
          if (!currentElimination.elements.includes(value)) currentElimination.elements.push(value);
        } else {
          eliminations.push({ rowIndex, columnIndex, elements: [value] });
        }
      }
    }
    for (const x of eliminations) {
      for (const value of x.elements) {
        removals.push({ rowIndex: x.rowIndex, columnIndex: x.columnIndex, value });
      }
    }

    return { removals, eliminations };
  }

  public static generateSingleSteps(step: FillStep): FillStep[] {
    const result: FillStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.fill.data) {
      sudoku.setCandidates(x.rowIndex, x.columnIndex, Sudoku.candidatesFactory(true, [x.value]));
      result.push({
        grid: Sudoku.cloneGrid(sudoku.getGrid()),
        fill: {
          strategy: step.fill.strategy,
          data: [x],
        },
      });
      sudoku.setInputValue(x, false);
    }

    return result;
  }

  public abstract canFill(sudoku: Sudoku): FillInputValueData[];

  public abstract canFillWithoutCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[];

  public abstract descriptionOfFillInputValueData(data: FillInputValueData): string;
}
