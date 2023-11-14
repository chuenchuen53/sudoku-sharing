import type { InputValueData, VirtualLineType } from "../type";
import type Sudoku from "../Sudoku";

export enum FillStrategyType {
  UNIQUE_MISSING = "UNIQUE_MISSING",
  NAKED_SINGLE = "NAKED_SINGLE",
  HIDDEN_SINGLE = "HIDDEN_SINGLE",
}

export interface RelatedLine {
  virtualLineType: VirtualLineType;
  lineIndex: number;
}

export interface FillInputValueData extends InputValueData {
  relatedLine?: RelatedLine;
}

export default abstract class FillStrategy {
  abstract canFill(sudoku: Sudoku): FillInputValueData[];
}
