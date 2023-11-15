import Sudoku from "../Sudoku";
import { SudokuLineUtil } from "../SudokuLine";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type RowColumn } from "../type";
import EliminationStrategy, { type Elimination, type EliminationData, type Highlight } from "./EliminationStrategy";

export default class LockedCandidates extends EliminationStrategy {
  private static readonly instance = new LockedCandidates();

  public static getInstance(): LockedCandidates {
    return LockedCandidates.instance;
  }

  public static rowColumnLockInBox(sudoku: Sudoku, lineType: RowColumn, index: number): EliminationData[] {
    const result: EliminationData[] = [];
    const virtualLine = lineType === VirtualLineType.ROW ? sudoku.getRow(index) : sudoku.getColumn(index);
    const missing = Sudoku.missingValuesInVirtualLine(virtualLine);
    const relatedBoxes = sudoku.getAllRelatedBoxesInRowOrColumn(lineType, index);

    SudokuSolver.loopCandidates((sudokuElement) => {
      if (!missing[sudokuElement]) return;

      const boxesContainedTheElement = relatedBoxes.filter((box) =>
        box.some((x) => (lineType === VirtualLineType.ROW ? x.rowIndex : x.columnIndex) === index && x.candidates?.[sudokuElement]),
      );
      if (boxesContainedTheElement.length !== 1) return;

      const lockedBox = boxesContainedTheElement[0];
      const eliminations: Elimination[] = [];
      const highlights: Highlight[] = [];
      lockedBox.forEach(({ rowIndex, columnIndex, candidates }) => {
        if (candidates?.[sudokuElement]) {
          if ((lineType === VirtualLineType.ROW ? rowIndex : columnIndex) === index) {
            highlights.push({
              position: { rowIndex, columnIndex },
              candidates: Sudoku.candidatesFactory(true, [sudokuElement]),
            });
          } else {
            eliminations.push({ rowIndex, columnIndex, elements: [sudokuElement] });
          }
        }
      });

      if (eliminations.length > 0) {
        const relatedRowOrColumn = SudokuLineUtil.sudokuLine(lineType, index);
        const firstCellInBox = lockedBox[0];
        const boxIndex = Sudoku.getBoxIndex(firstCellInBox.rowIndex, firstCellInBox.columnIndex);
        const relatedBox = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, boxIndex);
        const relatedLines = [relatedRowOrColumn, relatedBox];

        result.push({ eliminations, relatedLines, highlights });
      }
    });

    return result;
  }

  public static boxLockInRowColumn(sudoku: Sudoku, lineType: RowColumn, boxIndex: number): EliminationData[] {
    const result: EliminationData[] = [];
    const missing = Sudoku.missingValuesInVirtualLine(sudoku.getBoxFromBoxIndex(boxIndex));
    const relatedLines = sudoku.getAllRelatedRowsOrColumnsInBox(lineType, boxIndex);
    const box = sudoku.getBoxFromBoxIndex(boxIndex);

    SudokuSolver.loopCandidates((sudokuElement) => {
      if (!missing[sudokuElement]) return;

      const cellsContainTheElement = box.filter((x) => x.candidates?.[sudokuElement]);
      if (cellsContainTheElement.length === 0) return;
      const allInSameLine = cellsContainTheElement.every((x) =>
        lineType === VirtualLineType.ROW
          ? x.rowIndex === cellsContainTheElement[0].rowIndex
          : x.columnIndex === cellsContainTheElement[0].columnIndex,
      );
      if (!allInSameLine) return;

      const eliminations: Elimination[] = [];
      const highlights: Highlight[] = [];
      const lineIndex = lineType === VirtualLineType.ROW ? cellsContainTheElement[0].rowIndex : cellsContainTheElement[0].columnIndex;
      const virtualLine = relatedLines.find((x) => (lineType === VirtualLineType.ROW ? x[0].rowIndex : x[0].columnIndex) === lineIndex);
      virtualLine?.forEach(({ rowIndex, columnIndex, candidates }) => {
        if (candidates?.[sudokuElement]) {
          if (Sudoku.getBoxIndex(rowIndex, columnIndex) === boxIndex) {
            highlights.push({
              position: { rowIndex, columnIndex },
              candidates: Sudoku.candidatesFactory(true, [sudokuElement]),
            });
          } else {
            eliminations.push({ rowIndex, columnIndex, elements: [sudokuElement] });
          }
        }
      });

      if (eliminations.length > 0) {
        const relatedBox = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, boxIndex);
        const relatedRowOrColumn = SudokuLineUtil.sudokuLine(lineType, lineIndex);
        const relatedLines = [relatedBox, relatedRowOrColumn];

        result.push({ eliminations, relatedLines, highlights });
      }
    });

    return result;
  }

  public static getRemovalDueToLockedCandidates(sudoku: Sudoku): EliminationData[] {
    const indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const rowLockInBox = indexes.map((x) => LockedCandidates.rowColumnLockInBox(sudoku, VirtualLineType.ROW, x)).flat();
    const columnLockInBox = indexes.map((x) => LockedCandidates.rowColumnLockInBox(sudoku, VirtualLineType.COLUMN, x)).flat();
    const boxLockInRow = indexes.map((x) => LockedCandidates.boxLockInRowColumn(sudoku, VirtualLineType.ROW, x)).flat();
    const boxLockInColumn = indexes.map((x) => LockedCandidates.boxLockInRowColumn(sudoku, VirtualLineType.COLUMN, x)).flat();

    return [...rowLockInBox, ...columnLockInBox, ...boxLockInRow, ...boxLockInColumn];
  }

  private constructor() {
    super();
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return LockedCandidates.getRemovalDueToLockedCandidates(sudoku);
  }
}
