import FillStrategy, { type FillInputValueData } from "./FillStrategy";
import Sudoku from "./Sudoku";
import SudokuSolver from "./SudokuSolver";
import { VirtualLineType, type Candidates, type InputValueData, type SudokuElement, type UniqueMissingResult, type VirtualLine } from "./type";

export default class FillUniqueMissing extends FillStrategy {
  canFill(sudoku: Sudoku): FillInputValueData[] {
    return FillUniqueMissing.uniqueMissing(sudoku);
  }

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
      const uniqueCandidate = FillUniqueMissing.uniqueCandidate(missing);
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
    const rowResult = FillUniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = FillUniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = FillUniqueMissing.uniqueMissingFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);

    const combined = [...rowResult, ...columnResult, ...boxResult];
    return combined.filter((x, ix) => combined.findIndex((y) => Sudoku.isSamePos(x, y)) === ix);
  }
}
