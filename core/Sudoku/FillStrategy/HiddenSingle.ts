import Sudoku from "../Sudoku";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type SudokuElement, type VirtualLine, type Candidates, type Cell, type Position } from "../type";
import ArrUtil from "../../utils/ArrUtil";
import FillStrategy from "./FillStrategy";
import type { SudokuLine } from "../SudokuLine";
import type { FillInputValueData } from "./type";

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

  public static getSecondaryDataForEmptyCell(
    sudoku: Sudoku,
    emptyPosition: Position,
    value: SudokuElement,
    skip: VirtualLineType,
  ): { cell: Cell; relatedLine: SudokuLine } {
    if (skip !== VirtualLineType.ROW) {
      for (const cell of sudoku.getRow(emptyPosition.rowIndex)) {
        if (Sudoku.isSamePos(cell, emptyPosition)) continue;
        if (cell.clue === value || cell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, emptyPosition.rowIndex);
          return { cell, relatedLine };
        }
      }
    }
    if (skip !== VirtualLineType.COLUMN) {
      for (const cell of sudoku.getColumn(emptyPosition.columnIndex)) {
        if (Sudoku.isSamePos(cell, emptyPosition)) continue;
        if (cell.clue === value || cell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, emptyPosition.columnIndex);
          return { cell, relatedLine };
        }
      }
    }
    if (skip !== VirtualLineType.BOX) {
      for (const cell of sudoku.getBoxFromRowColumnIndex(emptyPosition.rowIndex, emptyPosition.columnIndex)) {
        if (Sudoku.isSamePos(cell, emptyPosition)) continue;
        if (cell.clue === value || cell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, Sudoku.getBoxIndex(emptyPosition.rowIndex, emptyPosition.columnIndex));
          return { cell, relatedLine };
        }
      }
    }

    throw new Error("logic error");
  }

  public static hiddenSingleFromVirtualLine(
    virtualLine: VirtualLine,
    virtualLineType: VirtualLineType,
    dataForNoCandidates?: { overrideCandidates: (Candidates | undefined)[][]; sudoku: Sudoku },
  ): FillInputValueData[] {
    const getCandidatesFn = (x: Cell) => (dataForNoCandidates ? dataForNoCandidates.overrideCandidates[x.rowIndex][x.columnIndex] : x.candidates);

    const result: FillInputValueData[] = [];
    const candidatesCount = HiddenSingle.candidatesCountFactory();
    for (const cell of virtualLine) {
      const candidates = getCandidatesFn(cell);
      if (!candidates) continue;
      SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && candidatesCount[sudokuElement].push(cell));
    }
    SudokuSolver.loopCandidates((sudokuElement) => {
      if (candidatesCount[sudokuElement].length !== 1) return;
      const cell = candidatesCount[sudokuElement][0];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (SudokuSolver.numberOfCandidates(getCandidatesFn(cell)!) === 1) {
        return; // naked single
      }
      if (dataForNoCandidates) {
        const emptyCells = virtualLine.filter((x) => !Sudoku.isSamePos(x, cell) && !(x.clue || x.inputValue));
        const secondaryData = emptyCells.map((x) =>
          HiddenSingle.getSecondaryDataForEmptyCell(dataForNoCandidates.sudoku, x, sudokuElement, virtualLineType),
        );
        const secondaryRelatedLines = ArrUtil.removeDuplicateValue(
          secondaryData.map((x) => x.relatedLine),
          (a, b) => a === b,
        );
        const secondaryHighlight = ArrUtil.removeDuplicateValue(
          secondaryData.map((x) => ({ rowIndex: x.cell.rowIndex, columnIndex: x.cell.columnIndex })),
          (a, b) => Sudoku.isSamePos(a, b),
        );
        result.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          value: sudokuElement,
          relatedLine: SudokuLineUtil.sudokuLineFromPosition(virtualLineType, cell),
          highlightWholeCell: true,
          secondaryRelatedLines,
          secondaryHighlight,
        });
      } else {
        result.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          value: sudokuElement,
          relatedLine: SudokuLineUtil.sudokuLineFromPosition(virtualLineType, cell),
        });
      }
    });

    return result;
  }

  public static hiddenSingleFromVirtualLines(
    virtualLines: VirtualLine[],
    virtualLineType: VirtualLineType,
    dataForNoCandidates?: { overrideCandidates: (Candidates | undefined)[][]; sudoku: Sudoku },
  ): FillInputValueData[] {
    const result: FillInputValueData[] = [];
    for (let i = 0; i < virtualLines.length; i++) {
      const data = this.hiddenSingleFromVirtualLine(virtualLines[i], virtualLineType, dataForNoCandidates);
      result.push(...data);
    }

    return result;
  }

  public static hiddenSingles(sudoku: Sudoku): FillInputValueData[] {
    const rowResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return Sudoku.removeDuplicatedPositionAndValue([...rowResult, ...columnResult, ...boxResult]);
  }

  public static hiddenSingleWithOverrideCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[] {
    const dataForNoCandidates = { overrideCandidates, sudoku };
    const rowResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW, dataForNoCandidates);
    const columnResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN, dataForNoCandidates);
    const boxResult = HiddenSingle.hiddenSingleFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX, dataForNoCandidates);
    return Sudoku.removeDuplicatedPositionAndValue([...rowResult, ...columnResult, ...boxResult]);
  }

  public override canFill(sudoku: Sudoku): FillInputValueData[] {
    return HiddenSingle.hiddenSingles(sudoku);
  }

  public override canFillWithoutCandidates(sudoku: Sudoku, overrideCandidates: (Candidates | undefined)[][]): FillInputValueData[] {
    return HiddenSingle.hiddenSingleWithOverrideCandidates(sudoku, overrideCandidates);
  }

  public override descriptionOfFillInputValueData(data: FillInputValueData): string {
    const { value, relatedLine } = data;
    const line = SudokuLineUtil.lineNameForDisplay(relatedLine!);
    return `${value} in ${line}`;
  }
}
