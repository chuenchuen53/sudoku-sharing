import type { InputValueData } from "../type";
import type Sudoku from "../Sudoku";
import type { SudokuLine } from "../SudokuLine";

export enum FillStrategyType {
  UNIQUE_MISSING = "UNIQUE_MISSING",
  NAKED_SINGLE = "NAKED_SINGLE",
  HIDDEN_SINGLE = "HIDDEN_SINGLE",
}

export interface FillInputValueData extends InputValueData {
  relatedLine?: SudokuLine;
  highlightWholeCell?: boolean;
}

export default abstract class FillStrategy {
  public static strategyName(strategy: FillStrategyType): string {
    return strategy.toLowerCase().replaceAll("_", " ");
  }

  public abstract canFill(sudoku: Sudoku): FillInputValueData[];
}
