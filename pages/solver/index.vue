\
<template>
  <div class="flex justify-center">
    <div class="relative flex w-full flex-col items-center justify-center gap-8 pb-6 lg:w-fit lg:flex-row lg:items-start lg:pb-24">
      <SudokuView
        :grid="inputGrid"
        :can-fill-data-arr="[]"
        :elimination-data-arr="[]"
        :invalid-positions="invalidPositions"
        :selected="selectedPosition"
        :on-cell-click="setSelectedPosition"
      />
      <div class="w-full max-w-xl space-y-4 lg:max-w-sm">
        <SudokuInputButtons
          :on-element-btn-click="fillSelected"
          :on-clear-btn-click="clearSelected"
          single-row-on-tablet-size
          :single-row-on-desktop-size="false"
        />
        <div class="flex justify-center gap-2">
          <button @click="undoActionFn" :disabled="!haveUndo" class="btn w-[135px]">
            Undo
            <IconRedo class="text-2xl" />
          </button>
          <button @click="clearGrid" class="btn w-[135px]">
            Clear all
            <IconEraser class="text-2xl" />
          </button>
        </div>
        <SudokuGridTextInput :on-input="replaceGrid" />
        <br />
        <button @click="handleSolveClick" class="btn btn-primary w-full lg:absolute lg:left-0 lg:top-[490px] lg:!mt-0 lg:w-fit" :disabled="loading">
          Solve
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        </button>
      </div>
    </div>

    <div v-if="showErrToastTimer !== null" class="toast toast-center toast-top mt-16">
      <div class="alert alert-error">
        <span>Invalid puzzle</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import Sudoku from "../../core/Sudoku/Sudoku";
import SudokuView from "../../components/SudokuView.vue";
import SudokuInputButtons from "../../components/SudokuInputButtons.vue";
import SudokuGridTextInput from "../../components/SudokuGridTextInput.vue";
import { useSolverStore } from "../../stores/solver";
import { useSolverSolutionStore } from "../../stores/solverSolution";
import SudokuInputUtil from "../../utils/SudokuInputUtil";
import type { Grid } from "../../core/Sudoku/type";
import IconRedo from "~/components/Icons/IconRedo.vue";
import IconEraser from "~/components/Icons/IconEraser.vue";

const solverStore = useSolverStore();
const solverSolutionStore = useSolverSolutionStore();

const { loading, selectedPosition, inputGrid, invalidPositions, haveUndo } = storeToRefs(solverStore);
const { setLoading, setSelectedPosition, fillSelected, clearSelected, clearGrid, replaceGrid, undoActionFn } = solverStore;

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

const handleSolveClick = () => {
  if (Sudoku.invalidCells(inputGrid.value).length > 0 || inputGrid.value.flatMap((x) => x).filter((x) => x.inputValue).length < 17) {
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
