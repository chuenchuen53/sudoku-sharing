import { VirtualLineType, type VirtualLine } from "../type";
import NakedMultiple from "./NakedMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class NakedTriplets extends NakedMultiple {
  private static readonly instance = new NakedTriplets();
  public static readonly SIZE_OF_CANDIDATE = 3;

  public static getInstance(): NakedTriplets {
    return NakedTriplets.instance;
  }

  public static nakedTripletsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return NakedMultiple.nakedMultipleFromVirtualLines(virtualLines, NakedTriplets.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static nakedTripletsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = NakedTriplets.nakedTripletsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = NakedTriplets.nakedTripletsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = NakedTriplets.nakedTripletsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }

  private constructor() {
    super();
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return NakedTriplets.nakedTripletsFromSudoku(sudoku);
  }
}
