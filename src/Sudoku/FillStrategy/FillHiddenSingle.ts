import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type CandidateCell, type SudokuElement, type VirtualLine } from "../type";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";

export default class FillHiddenSingle extends FillStrategy {
  canFill(sudoku: Sudoku): FillInputValueData[] {
    return FillHiddenSingle.hiddenSingles(sudoku);
  }

  static candidatesCountFactory(): Record<SudokuElement, number> {
    return {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
    };
  }

  static hiddenSingles(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = FillHiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = FillHiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = FillHiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  static hiddenSingleFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const candidatesCount = FillHiddenSingle.candidatesCountFactory();
      for (const cell of virtualLine) {
        const candidates = cell.candidates;
        if (!candidates) continue;
        SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && candidatesCount[sudokuElement]++);
      }
      SudokuSolver.loopCandidates((sudokuElement) => {
        if (candidatesCount[sudokuElement] !== 1) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cell = virtualLine.find((x) => x.candidates?.[sudokuElement])!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (SudokuSolver.numberOfCandidates(cell.candidates!) === 1) return; // naked single
        result.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          value: sudokuElement,
          relatedLine: {
            virtualLineType,
            lineIndex: i,
          },
        });
      });
    }

    return result;
  }
}
