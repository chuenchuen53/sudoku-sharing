import { VirtualLineType, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import HiddenMultiple from "./HiddenMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./type";

export default class HiddenTriplets extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 3;
  public static readonly instance = new HiddenTriplets();

  private constructor() {
    super();
  }

  public static getInstance(): HiddenTriplets {
    return HiddenTriplets.instance;
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

  public override descriptionOfEliminationData(data: EliminationData): string {
    const { relatedLines, highlights } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLines[0]);
    const candidatesArr = highlights
      .map((x) => SudokuSolver.getCandidatesArr(x.candidates))
      .flat()
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .sort();
    return `(${candidatesArr.join(", ")}) in ${line}`;
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenTriplets.hiddenTripletsFromSudoku(sudoku);
  }
}
