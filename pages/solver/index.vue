<template>
  <div class="space-y-8">
    <SudokuView
      :grid="inputGrid"
      :can-fill-data-arr="[]"
      :elimination-data-arr="[]"
      :invalid-positions="invalidPositions"
      :selected="selectedPosition"
      :on-cell-click="setSelectedPosition"
    />
    <SudokuInputButtons :on-element-btn-click="fillSelected" :on-clear-btn-click="clearSelected" />
    <SudokuGridTextInput :on-input="replaceGrid" />
    <button @click="handleSolve" class="btn btn-primary w-full" :disabled="loading">
      Solve
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
    </button>

    <div v-if="showErrToastTimer !== null" class="toast toast-top toast-center">
      <div class="alert alert-error">
        <span>Invalid puzzle</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import Sudoku from "../../core/Sudoku/Sudoku";
import SudokuView from "../../components/SudokuView.vue";
import SudokuInputButtons from "../../components/SudokuInputButtons.vue";
import SudokuGridTextInput from "../../components/SudokuGridTextInput.vue";
import { useSolverStore } from "../../stores/solver";
import { useSolverSolutionStore } from "../../stores/solverSolution";
import type { Grid } from "../../core/Sudoku/type";

const solverStore = useSolverStore();
const solverSolutionStore = useSolverSolutionStore();

const { loading, selectedPosition, inputGrid, invalidPositions } = storeToRefs(solverStore);
const { setLoading, setSelectedPosition, fillSelected, clearSelected, replaceGrid } = solverStore;

const showErrToastTimer = ref<number | null>(null);

const handleSolve = () => {
  if (Sudoku.invalidCells(inputGrid.value).length > 0) {
    if (showErrToastTimer.value) window.clearTimeout(showErrToastTimer.value);
    showErrToastTimer.value = window.setTimeout(() => {
      showErrToastTimer.value = null;
    }, 2000);
    return;
  }

  setLoading(true);
  setTimeout(() => {
    const grid: Grid = inputGrid.value.map((row) => row.map((x) => ({ rowIndex: x.rowIndex, columnIndex: x.columnIndex, clue: x.inputValue })));
    const sudoku = Sudoku.sudokuFromGrid(grid);
    const sudokuSolver = new SudokuSolver(sudoku);
    sudokuSolver.trySolve();
    solverSolutionStore.setData({
      puzzle: grid,
      steps: sudokuSolver.getSteps(),
    });
    setLoading(false);
    navigateTo("/solver/solution");
  }, 100);
};
</script>
