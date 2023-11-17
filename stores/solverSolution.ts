import { defineStore } from "pinia";
import { shallowRef } from "vue";
import type { Grid } from "../core/Sudoku/type";
import type { Step } from "../core/Sudoku/SudokuSolver";

interface PageState {
  puzzle: Grid;
  steps: Step[];
}

export const useSolverSolutionStore = defineStore("solverSolution", () => {
  const data = shallowRef<PageState | null>(null);

  function setData(newData: PageState) {
    data.value = newData;
  }

  function clearData() {
    data.value = null;
  }

  return {
    data,
    setData,
    clearData,
  };
});
