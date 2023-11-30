import Sudoku from "./Sudoku";
import { SudokuLineUtil } from "./SudokuLine";
import { VirtualLineType, type VirtualLine, type SudokuElement, type Position, type Cell } from "./type";
import { type FillStep } from "./SudokuSolver";
import { FillStrategyType } from "./FillStrategy/FillStrategy";
import type { SudokuLine } from "./SudokuLine";


export default class SingleFillStep {
  private constructor() {}

  public static singularizeSteps(step: FillStep): FillStep[] {
    const strategy = step.fill.strategy;

    if(strategy !== FillStrategyType.HIDDEN_SINGLE) throw new Error("not implemented");

    const result: FillStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.fill.data) {
      const { virtualLineType, lineIndex } = SudokuLineUtil.lineTypeAndIndex(x.relatedLine!);
      let vl: VirtualLine;
      switch (virtualLineType) {
        case VirtualLineType.ROW:
          vl = sudoku.getRow(lineIndex);
          break;
        case VirtualLineType.COLUMN:
          vl = sudoku.getColumn(lineIndex);
          break;
        case VirtualLineType.BOX:
          vl = sudoku.getBoxFromBoxIndex(lineIndex);
          break;
      }

      const secondaryRelatedLines: SudokuLine[] = [];
      const secondaryHighlight: Position[] = [];

      for (const cell of vl) {
        if (Sudoku.isSamePos(cell, x)) continue;
        if (cell.clue || cell.inputValue) continue;
        const relatedData = SingleFillStep.foundRelatedCellAndRelatedLine(sudoku, cell, x.value, virtualLineType);
        secondaryRelatedLines.push(relatedData.relatedLine);
        secondaryHighlight.push({ rowIndex: relatedData.cell.rowIndex, columnIndex: relatedData.cell.columnIndex });
      }

      secondaryRelatedLines.filter((x, i) => secondaryRelatedLines.findIndex(y => x.toString() === y.toString()) === i);
      secondaryHighlight.filter((x, i) => secondaryHighlight.findIndex(y => Sudoku.isSamePos(x, y)) === i);

      result.push({
        grid: Sudoku.cloneGrid(sudoku.grid),
        fill: {
          strategy,
          data: [
            {
              rowIndex: x.rowIndex,
              columnIndex: x.columnIndex,
              value: x.value,
              mainRelatedLine: x.relatedLine,
              secondaryRelatedLines,
              secondaryHighlight,
            }
          ],
        },
      });

      sudoku.setInputValue(x, false);
    }

    return result;
  }

  static foundRelatedCellAndRelatedLine(sudoku: Sudoku, target: Position, value: SudokuElement, skip: VirtualLineType): { cell: Cell; relatedLine: SudokuLine } {
    if(skip !== VirtualLineType.ROW){
      for (const relatedCell of sudoku.getRow(target.rowIndex)) {
        if (Sudoku.isSamePos(relatedCell, target)) continue;
        if (relatedCell.clue === value || relatedCell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, target.rowIndex);
          return { cell: relatedCell, relatedLine };
        }
      }
    }
    if(skip !== VirtualLineType.COLUMN){
      for (const relatedCell of sudoku.getColumn(target.columnIndex)) {
        if (Sudoku.isSamePos(relatedCell, target)) continue;
        if (relatedCell.clue === value || relatedCell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, target.columnIndex);
          return { cell: relatedCell, relatedLine };
        }
      }
    }
    if(skip !== VirtualLineType.BOX){
      for (const relatedCell of sudoku.getBoxFromRowColumnIndex(target.rowIndex, target.columnIndex)) {
        if (Sudoku.isSamePos(relatedCell, target)) continue;
        if (relatedCell.clue === value || relatedCell.inputValue === value) {
          const boxIndex = Sudoku.getBoxIndex(target.rowIndex, target.columnIndex);
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, boxIndex);
          return { cell: relatedCell, relatedLine };
        }
      }
    }

    throw new Error("logic error");
  }
}
