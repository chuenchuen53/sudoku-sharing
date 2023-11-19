import Sudoku from "../Sudoku";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type SudokuElement, type VirtualLine } from "../type";
import FillStrategy, { type FillInputValueData } from "./FillStrategy";

export default class HiddenSingle extends FillStrategy {
  private static readonly instance = new HiddenSingle();

  private constructor() {
    super();
  }

  public static getInstance(): HiddenSingle {
    return HiddenSingle.instance;
  }

  public static candidatesCountFactory(): Record<SudokuElement, number> {
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

  public static hiddenSingleFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const candidatesCount = HiddenSingle.candidatesCountFactory();
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

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { value, relatedLine } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLine!);
    return `Hidden Single: ${value} in ${line}`;
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return HiddenSingle.hiddenSingles(sudoku);
  }
}
