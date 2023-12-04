import Sudoku from "../Sudoku";
import { type SudokuLine, SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type Candidates, type SudokuElement, type VirtualLine } from "../type";
import FillStrategy from "./FillStrategy";
import type { FillInputValueData } from "./type";

export default class UniqueMissing extends FillStrategy {
  private static readonly instance = new UniqueMissing();

  private constructor() {
    super();
  }

  public static getInstance(): UniqueMissing {
    return UniqueMissing.instance;
  }

  public static uniqueCandidate(candidates: Candidates): SudokuElement | null {
    const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
    return candidatesArr.length === 1 ? candidatesArr[0] : null;
  }

  public static uniqueMissingInVirtualLine(virtualLine: VirtualLine, relatedLine: SudokuLine): FillInputValueData | null {
    const missing = Sudoku.missingValuesInVirtualLine(virtualLine);
    const uniqueCandidate = UniqueMissing.uniqueCandidate(missing);
    if (uniqueCandidate === null) return null;
    const cell = virtualLine.find((x) => !x.clue && !x.inputValue);
    if (!cell) return null; // only happen when sudoku is invalid
    return {
      rowIndex: cell.rowIndex,
      columnIndex: cell.columnIndex,
      value: uniqueCandidate,
      relatedLine,
      highlightWholeCell: true,
    };
  }

  public static uniqueMissingInVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): FillInputValueData[] {
    const result: FillInputValueData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const data = UniqueMissing.uniqueMissingInVirtualLine(virtualLine, SudokuLineUtil.sudokuLine(virtualLineType, i));
      if (data !== null) result.push(data);
    }

    return result;
  }

  public static uniqueMissing(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = UniqueMissing.uniqueMissingInVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = UniqueMissing.uniqueMissingInVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = UniqueMissing.uniqueMissingInVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);

    const combined = [...rowResult, ...columnResult, ...boxResult];
    return Sudoku.removeDuplicatedPositionAndValue(combined);
  }

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { value, relatedLine } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLine!);
    return `${value} in ${line}`;
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return UniqueMissing.uniqueMissing(sudoku);
  }

  public override canFillWithoutCandidates(sudoku: Sudoku): FillInputValueData[] {
    return UniqueMissing.uniqueMissing(sudoku);
  }
}
