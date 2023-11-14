import { VirtualLineType, type VirtualLine } from "../type";
import HiddenMultiple from "./HiddenMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class HiddenQuads extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 4;

  public static hiddenQuadsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return HiddenMultiple.hiddenMultipleFromVirtualLines(virtualLines, HiddenQuads.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static hiddenQuadsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }
  public canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenQuads.hiddenQuadsFromSudoku(sudoku);
  }
}
