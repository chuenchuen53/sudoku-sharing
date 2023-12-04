import { defineStore } from "pinia";
import { shallowRef } from "vue";
import type { Grid, Step } from "../core/Sudoku/type";
import type { Stats } from "../core/Sudoku/SolveStats";

interface PageState {
  puzzle: Grid;
  steps: Step[];
  stats: Stats;
}

export const useSolverSolutionStore = defineStore("solverSolution", () => {
  const data = shallowRef<PageState | null>(null);

  function setData(newData: PageState) {
    data.value = newData;
  }

  return {
    data,
    setData,
  };
});
