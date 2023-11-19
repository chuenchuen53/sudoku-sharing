import { VirtualLineType, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import NakedMultiple from "./NakedMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class NakedQuads extends NakedMultiple {
  public static readonly SIZE_OF_CANDIDATE = 4;
  private static readonly instance = new NakedQuads();

  private constructor() {
    super();
  }

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

  public override descriptionOfEliminationData(data: EliminationData): string {
    const { relatedLines, highlights } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLines[0]);
    const candidatesArr = highlights
      .map((x) => SudokuSolver.getCandidatesArr(x.candidates))
      .flat()
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .sort();
    return `Naked Quads: (${candidatesArr.join(", ")}) in ${line}`;
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return NakedQuads.nakedQuadsFromSudoku(sudoku);
  }
}
