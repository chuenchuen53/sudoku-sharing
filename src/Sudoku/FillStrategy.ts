import type Sudoku from "./Sudoku";
import type { InputValueData, VirtualLineType } from "./type";

interface RelatedLine {
  virtualLineType: VirtualLineType;
  lineIndex: number;
}

export interface FillInputValueData extends InputValueData {
  relatedLine?: RelatedLine;
}

export default abstract class FillStrategy {
  abstract canFill(sudoku: Sudoku): FillInputValueData[];
}
