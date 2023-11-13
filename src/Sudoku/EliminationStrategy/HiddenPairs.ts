import type Sudoku from "../Sudoku";
import { VirtualLineType, type VirtualLine } from "../type";
import type { EliminationData } from "./EliminationStrategy";
import HiddenMultiple from "./HiddenMultiple";

export default class HiddenPairs extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 2;

  public canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenPairs.hiddenPairsFromSudoku(sudoku);
  }

  public static hiddenPairsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return HiddenMultiple.hiddenMultipleFromVirtualLines(virtualLines, HiddenPairs.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static hiddenPairsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = HiddenPairs.hiddenPairsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenPairs.hiddenPairsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenPairs.hiddenPairsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }
}
