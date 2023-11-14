import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type Candidates, type SudokuElement, type VirtualLine } from "../type";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";

export default class UniqueMissing extends FillStrategy {
  static uniqueCandidate(candidates: Candidates): SudokuElement | null {
    const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
    return candidatesArr.length === 1 ? candidatesArr[0] : null;
  }

  static uniqueMissingFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): FillInputValueData[] {
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
          relatedLine: { virtualLineType, lineIndex: i },
        });
      }
    }

    return result;
  }

  static uniqueMissing(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = UniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);

    const combined = [...rowResult, ...columnResult, ...boxResult];
    return combined.filter((x, ix) => combined.findIndex((y) => Sudoku.isSamePos(x, y)) === ix);
  }

  canFill(sudoku: Sudoku): FillInputValueData[] {
    return UniqueMissing.uniqueMissing(sudoku);
  }
}
