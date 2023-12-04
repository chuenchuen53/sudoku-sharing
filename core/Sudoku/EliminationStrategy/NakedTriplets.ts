import { VirtualLineType, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import NakedMultiple from "./NakedMultiple";
import type Sudoku from "../Sudoku";
import type { EliminationData } from "./type";

export default class NakedTriplets extends NakedMultiple {
  public static readonly SIZE_OF_CANDIDATE = 3;
  private static readonly instance = new NakedTriplets();

  private constructor() {
    super();
  }

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
    return NakedTriplets.nakedTripletsFromSudoku(sudoku);
  }
}
