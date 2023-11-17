import type { Step } from "../core/Sudoku/SudokuSolver";
import type { Grid } from "../core/Sudoku/type";

interface SolverSolutionState {
  puzzle: Grid | null;
  steps: Step[] | null;
}

export const useSolverSolutionState = () =>
  useState<SolverSolutionState>("solverSolutionState", () =>
    shallowRef({
      puzzle: null,
      steps: null,
    }),
  );
