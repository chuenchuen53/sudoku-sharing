import type { Position, PositionAndValue } from "../type";
import type { SudokuLine } from "../SudokuLine";

export enum FillStrategyType {
  UNIQUE_MISSING = "UNIQUE_MISSING",
  NAKED_SINGLE = "NAKED_SINGLE",
  HIDDEN_SINGLE = "HIDDEN_SINGLE",
}

export interface FillInputValueData extends PositionAndValue {
  relatedLine?: SudokuLine;
  highlightWholeCell?: true;
  secondaryRelatedLines?: SudokuLine[];
  secondaryHighlight?: Position[];
}
