import { VirtualLineType, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import HiddenMultiple from "./HiddenMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./EliminationStrategy";

export default class HiddenPairs extends HiddenMultiple {
  public static readonly SIZE_OF_CANDIDATE = 2;
  private static readonly instance = new HiddenPairs();

  private constructor() {
    super();
  }

  public static getInstance(): HiddenPairs {
    return HiddenPairs.instance;
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

  public override descriptionOfEliminationData(data: EliminationData): string {
    const { relatedLines, highlights } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLines[0]);
    const candidatesArr = highlights
      .map((x) => SudokuSolver.getCandidatesArr(x.candidates))
      .flat()
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .sort();
    return `Hidden Pairs: (${candidatesArr.join(", ")}) in ${line}`;
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return HiddenPairs.hiddenPairsFromSudoku(sudoku);
  }
}
