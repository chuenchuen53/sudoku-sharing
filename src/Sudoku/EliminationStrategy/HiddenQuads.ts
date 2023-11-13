import type Sudoku from "../Sudoku";
import { VirtualLineType, type VirtualLine } from "../type";
import type { EliminationData } from "./EliminationStrategy";
import HiddenMultiple from "./HiddenMultiple";

export default class HiddenQuads extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 4;

  public canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenQuads.hiddenQuadsFromSudoku(sudoku);
  }

  public static hiddenQuadsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return HiddenMultiple.hiddenMultipleFromVirtualLines(virtualLines, HiddenQuads.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static hiddenQuadsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenQuads.hiddenQuadsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }
}
