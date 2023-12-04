import Sudoku from "./Sudoku";
import { SudokuLineUtil } from "./SudokuLine";
import { VirtualLineType, type VirtualLine, type SudokuElement, type Position, type Cell, FillStep } from "./type";
import { FillStrategyType } from "./FillStrategy/FillStrategy";
import type { SudokuLine } from "./SudokuLine";

export default class SingleFillStep {
  private constructor() {}

  public static singularizeSteps(step: FillStep): FillStep[] {
    const strategy = step.fill.strategy;

    switch (strategy) {
      case FillStrategyType.NAKED_SINGLE:
        return SingleFillStep.NakedSingle(step);
      case FillStrategyType.HIDDEN_SINGLE:
        return SingleFillStep.hiddenSingle(step);
      case FillStrategyType.UNIQUE_MISSING:
        throw new Error("not implemented");
    }
  }

  static NakedSingle(step: FillStep): FillStep[] {
    const result: FillStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.fill.data) {
      const { rowIndex, columnIndex, value } = x;
      const candidates = Sudoku.candidatesFactory(true, [value]);
      sudoku.setCandidates(rowIndex, columnIndex, candidates);
      const rowLine = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, rowIndex);
      const columnLine = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, columnIndex);
      const boxLine = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, Sudoku.getBoxIndex(rowIndex, columnIndex));
      result.push({
        grid: Sudoku.cloneGrid(sudoku.grid),
        fill: {
          strategy: FillStrategyType.NAKED_SINGLE,
          data: [
            {
              rowIndex,
              columnIndex,
              value,
              secondaryRelatedLines: [rowLine, columnLine, boxLine],
              highlightWholeCell: true,
            },
          ],
        },
      });
      sudoku.setInputValue(x, false);
    }

    return result;
  }

  static hiddenSingle(step: FillStep) {
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

      secondaryRelatedLines.filter((x, i) => secondaryRelatedLines.findIndex((y) => x.toString() === y.toString()) === i);
      secondaryHighlight.filter((x, i) => secondaryHighlight.findIndex((y) => Sudoku.isSamePos(x, y)) === i);

      sudoku.setCandidates(x.rowIndex, x.columnIndex, Sudoku.candidatesFactory(true, [x.value]));
      result.push({
        grid: Sudoku.cloneGrid(sudoku.grid),
        fill: {
          strategy: FillStrategyType.HIDDEN_SINGLE,
          data: [
            {
              rowIndex: x.rowIndex,
              columnIndex: x.columnIndex,
              value: x.value,
              mainRelatedLine: x.relatedLine,
              secondaryRelatedLines,
              secondaryHighlight,
              highlightWholeCell: true,
            },
          ],
        },
      });
      sudoku.setInputValue(x, false);
    }

    return result;
  }

  static foundRelatedCellAndRelatedLine(
    sudoku: Sudoku,
    target: Position,
    value: SudokuElement,
    skip: VirtualLineType,
  ): { cell: Cell; relatedLine: SudokuLine } {
    if (skip !== VirtualLineType.ROW) {
      for (const relatedCell of sudoku.getRow(target.rowIndex)) {
        if (Sudoku.isSamePos(relatedCell, target)) continue;
        if (relatedCell.clue === value || relatedCell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, target.rowIndex);
          return { cell: relatedCell, relatedLine };
        }
      }
    }
    if (skip !== VirtualLineType.COLUMN) {
      for (const relatedCell of sudoku.getColumn(target.columnIndex)) {
        if (Sudoku.isSamePos(relatedCell, target)) continue;
        if (relatedCell.clue === value || relatedCell.inputValue === value) {
          const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, target.columnIndex);
          return { cell: relatedCell, relatedLine };
        }
      }
    }
    if (skip !== VirtualLineType.BOX) {
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
