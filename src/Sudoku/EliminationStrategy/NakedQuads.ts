import { VirtualLineType, type VirtualLine } from "../type";
import NakedMultiple from "./NakedMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class NakedQuads extends NakedMultiple {
  private static readonly instance = new NakedQuads();
  public static readonly SIZE_OF_CANDIDATE = 4;

  public static getInstance(): NakedQuads {
    return NakedQuads.instance;
  }

  public static nakedQuadsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    return NakedMultiple.nakedMultipleFromVirtualLines(virtualLines, NakedQuads.SIZE_OF_CANDIDATE, virtualLineType);
  }

  public static nakedQuadsFromSudoku(sudoku: Sudoku): EliminationData[] {
    const rowResult = NakedQuads.nakedQuadsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = NakedQuads.nakedQuadsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = NakedQuads.nakedQuadsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }

  private constructor() {
    super();
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return NakedQuads.nakedQuadsFromSudoku(sudoku);
  }
}
