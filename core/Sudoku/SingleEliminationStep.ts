import EliminationStrategy from "./EliminationStrategy/EliminationStrategy";
import Sudoku from "./Sudoku";
import type { EliminationStep } from "./SudokuSolver";

export default class SingleEliminationStep {
  private constructor() {}

  public static singularizeSteps(step: EliminationStep): EliminationStep[] {
    const strategy = step.elimination.strategy;

    const result: EliminationStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.elimination.data) {
      const removals = EliminationStrategy.removalsFromEliminationData([x]);

      result.push({
        grid: Sudoku.cloneGrid(sudoku.grid),
        elimination: {
          strategy,
          data: [x],
        },
      });
      if (sudoku.removeElementInCandidates(removals) === 0) result.pop();
    }

    return result;
  }
}
