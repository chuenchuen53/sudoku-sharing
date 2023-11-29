import Sudoku from "./Sudoku";
import { SudokuLineUtil } from "./SudokuLine";
import { VirtualLineType, type VirtualLine, type SudokuElement, type Position, type Cell, type InputClues } from "./type";
import SudokuSolver from "./SudokuSolver";
import { FillStrategyType } from "./FillStrategy/FillStrategy";
import type { SudokuLine } from "./SudokuLine";
import type { NoCandidateFillStep, SingleNoCandidateFillStep } from "./SudokuSolver";

export default class SingleFillStep {
  private constructor() {}

  public static singularizeSteps(step: NoCandidateFillStep): SingleNoCandidateFillStep[] {
    const strategy = step.noCandidateFill.strategy;

    const result: SingleNoCandidateFillStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.noCandidateFill.data) {
      // todo check undefined
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

      const secondaryHighlight: {
        position: Position;
        relatedLine: SudokuLine;
        crossPosition: Position;
      }[] = [];

      for (const cell of vl) {
        if (Sudoku.isSamePos(cell, x)) continue;
        if (cell.clue || cell.inputValue) continue;
        const relatedData = SingleFillStep.foundRelatedCellAndRelatedLine(sudoku, cell, x.value);
        secondaryHighlight.push({
          position: relatedData.cell,
          relatedLine: relatedData.relatedLine,
          crossPosition: cell,
        });
      }

      result.push({
        grid: initGrid,
        singleNoCandidateFill: {
          strategy,
          data: x,
          tempCandidate: Sudoku.candidatesFactory(true, [x.value]),
          secondaryHighlight,
        },
      });

      sudoku.setInputValue(x, false);
    }

    return result;
  }

  static foundRelatedCellAndRelatedLine(sudoku: Sudoku, target: Position, value: SudokuElement): { cell: Cell; relatedLine: SudokuLine } {
    for (const relatedCell of sudoku.getRow(target.rowIndex)) {
      if (Sudoku.isSamePos(relatedCell, target)) continue;
      if (relatedCell.clue === value || relatedCell.inputValue === value) {
        const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, target.rowIndex);
        return { cell: relatedCell, relatedLine };
      }
    }
    for (const relatedCell of sudoku.getColumn(target.columnIndex)) {
      if (Sudoku.isSamePos(relatedCell, target)) continue;
      if (relatedCell.clue === value || relatedCell.inputValue === value) {
        const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, target.rowIndex);
        return { cell: relatedCell, relatedLine };
      }
    }
    for (const relatedCell of sudoku.getBoxFromRowColumnIndex(target.rowIndex, target.columnIndex)) {
      if (Sudoku.isSamePos(relatedCell, target)) continue;
      if (relatedCell.clue === value || relatedCell.inputValue === value) {
        const boxIndex = Sudoku.getBoxIndex(target.rowIndex, target.columnIndex);
        const relatedLine = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, boxIndex);
        return { cell: relatedCell, relatedLine };
      }
    }

    throw new Error("logic error");
  }
}
