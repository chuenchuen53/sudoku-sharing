import EliminationStrategy from "./EliminationStrategy/EliminationStrategy";
import Sudoku from "./Sudoku";
import { SudokuLineUtil } from "./SudokuLine";
import { VirtualLineType, type VirtualLine } from "./type";
import type { EliminationStep, NoCandidateFillStep, SingleNoCandidateFillStep } from "./SudokuSolver";

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
        relatedLine: VirtualLine;
        crossPosition: Position;
      }[] = [];

      for (const cell of vl) {
        if (Sudoku.isSamePos(cell, x)) continue;
        if (cell.clue || cell.inputValue) continue;
      }
    }

    return result;
  }
}
