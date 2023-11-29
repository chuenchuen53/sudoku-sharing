import Sudoku from "../Sudoku";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type SudokuElement, type VirtualLine, type Candidates, type Cell } from "../type";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";

export default class HiddenSingle extends FillStrategy {
  private static readonly instance = new HiddenSingle();

  private constructor() {
    super();
  }

  public static getInstance(): HiddenSingle {
    return HiddenSingle.instance;
  }

  public static candidatesCountFactory(): Record<SudokuElement, Cell[]> {
    return {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      "9": [],
    };
  }

  public static hiddenSingleFromVirtualLines(
    virtualLines: VirtualLine[],
    virtualLineType: VirtualLineType,
    overrideCandidates?: (Candidates | undefined)[][],
  ): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const candidatesCount = HiddenSingle.candidatesCountFactory();
      for (const cell of virtualLine) {
        const candidates = overrideCandidates ? overrideCandidates[cell.rowIndex][cell.columnIndex] : cell.candidates;
        if (!candidates) continue;
        SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && candidatesCount[sudokuElement].push(cell));
      }
      SudokuSolver.loopCandidates((sudokuElement) => {
        if (candidatesCount[sudokuElement].length !== 1) return;
        const cell = candidatesCount[sudokuElement][0];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (SudokuSolver.numberOfCandidates(overrideCandidates ? overrideCandidates[cell.rowIndex][cell.columnIndex]! : cell.candidates!) === 1) {
          return; // naked single
        }
        result.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          value: sudokuElement,
          relatedLine: SudokuLineUtil.sudokuLine(virtualLineType, i),
        });
      });
    }

    return result;
  }

  public static hiddenSingles(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  public static hiddenSingleWithOverrideCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[] {
    const rowResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW, overrideCandidates);
    const columnResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN, overrideCandidates);
    const boxResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX, overrideCandidates);
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { value, relatedLine } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLine!);
    return `Hidden Single: ${value} in ${line}`;
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return HiddenSingle.hiddenSingles(sudoku);
  }
}
