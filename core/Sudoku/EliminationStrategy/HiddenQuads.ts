import { VirtualLineType, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import HiddenMultiple from "./HiddenMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class HiddenQuads extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 4;
  private static readonly instance = new HiddenQuads();

  private constructor() {
    super();
  }

  public static getInstance(): HiddenQuads {
    return HiddenQuads.instance;
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

  public override descriptionOfEliminationData(data: EliminationData): string {
    const { relatedLines, highlights } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLines[0]);
    const candidatesArr = highlights
      .map((x) => SudokuSolver.getCandidatesArr(x.candidates))
      .flat()
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .sort();
    return `Hidden Quads: (${candidatesArr.join(", ")}) in ${line}`;
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenQuads.hiddenQuadsFromSudoku(sudoku);
  }
}
