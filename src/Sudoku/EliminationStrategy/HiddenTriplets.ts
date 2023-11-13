import type Sudoku from "../Sudoku";
import { VirtualLineType, type VirtualLine } from "../type";
import type { EliminationData } from "./EliminationStrategy";
import HiddenMultiple from "./HiddenMultiple";

export default class HiddenTriplets extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 3;

  public canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenTriplets.hiddenTripletsFromSudoku(sudoku);
  }

  public static hiddenTripletsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return HiddenMultiple.hiddenMultipleFromVirtualLines(virtualLines, HiddenTriplets.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static hiddenTripletsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = HiddenTriplets.hiddenTripletsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenTriplets.hiddenTripletsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenTriplets.hiddenTripletsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }
}
