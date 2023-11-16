import Sudoku from "../Sudoku";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type Candidates, type SudokuElement, type VirtualLine } from "../type";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";

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

  public static uniqueMissingFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    const missingArr = virtualLines.map((x) => Sudoku.missingValuesInVirtualLine(x));

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missing = missingArr[i];
      const uniqueCandidate = UniqueMissing.uniqueCandidate(missing);
      if (uniqueCandidate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cell = virtualLine.find((x) => !x.clue && !x.inputValue)!;
        result.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          value: uniqueCandidate,
          relatedLine: SudokuLineUtil.sudokuLine(virtualLineType, i),
          highlightWholeCell: true,
        });
      }
    }

    return result;
  }

  public static uniqueMissing(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);

    const combined = [...rowResult, ...columnResult, ...boxResult];
    return combined.filter((x, ix) => combined.findIndex((y) => Sudoku.isSamePos(x, y)) === ix);
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return UniqueMissing.uniqueMissing(sudoku);
  }
}
