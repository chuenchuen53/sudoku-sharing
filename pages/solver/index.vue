<template>
  <div class="flex flex-col items-center space-y-8 w-full">
    <div class="flex flex-col lg:flex-row gap-8 relative pb-20">
      <div>
        <SudokuView
          :grid="inputGrid"
          :can-fill-data-arr="[]"
          :elimination-data-arr="[]"
          :invalid-positions="invalidPositions"
          :selected="selectedPosition"
          :on-cell-click="setSelectedPosition"
        />
        <button @click="handleSolve" class="absolute bottom-0 w-full btn btn-primary lg:static lg:inline-block lg:w-fit lg:mt-4" :disabled="loading">
          Solve
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
      <div class="max-w-lg w-full space-y-8">
        <SudokuInputButtons :on-element-btn-click="fillSelected" :on-clear-btn-click="clearSelected" />
        <div class="flex gap-2 justify-center">
          <button class="btn">Undo</button>
          <button @click="clearGrid" class="btn">Clear all</button>
        </div>
        <SudokuGridTextInput :on-input="replaceGrid" />
      </div>
    </div>

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
import SudokuInputUtil from "../../utils/SudokuInputUtil";
import type { Grid } from "../../core/Sudoku/type";

const solverStore = useSolverStore();
const solverSolutionStore = useSolverSolutionStore();

const { loading, selectedPosition, inputGrid, invalidPositions } = storeToRefs(solverStore);
const { setLoading, setSelectedPosition, fillSelected, clearSelected, clearGrid, replaceGrid } = solverStore;

const showErrToastTimer = ref<number | null>(null);

const handleKeyDown = (e: KeyboardEvent) => {
  if (document.activeElement?.tagName === "TEXTAREA") return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Delete"].includes(e.key)) {
    e.preventDefault();
  }
  switch (e.key) {
    case "ArrowUp":
      setSelectedPosition(SudokuInputUtil.newSelectedPosition(e.ctrlKey ? -8 : -1, 0, selectedPosition.value));
      break;
    case "ArrowDown":
      setSelectedPosition(SudokuInputUtil.newSelectedPosition(e.ctrlKey ? 8 : 1, 0, selectedPosition.value));
      break;
    case "ArrowLeft":
      setSelectedPosition(SudokuInputUtil.newSelectedPosition(0, e.ctrlKey ? -8 : -1, selectedPosition.value));
      break;
    case "ArrowRight":
      setSelectedPosition(SudokuInputUtil.newSelectedPosition(0, e.ctrlKey ? 8 : 1, selectedPosition.value));
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      fillSelected(e.key);
      break;
    case "Backspace":
    case "Delete":
      clearSelected();
      break;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

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
      stats: sudokuSolver.getStats(),
    });
    setLoading(false);
    navigateTo("/solver/solution");
  }, 100);
};
</script>
