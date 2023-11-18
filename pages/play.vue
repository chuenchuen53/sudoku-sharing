<template>
  <div class="flex flex-col items-center w-full">
    <SudokuView
      :grid="inputGrid"
      :can-fill-data-arr="[]"
      :elimination-data-arr="[]"
      :invalid-positions="invalidPositions"
      :selected="selectedPosition"
      :on-cell-click="setSelectedPosition"
    />
    <div class="flex flex-col lg:flex-row gap-8 relative pb-20 my-8">
      <SudokuInputButtons :on-element-btn-click="fillSelected" :on-clear-btn-click="clearSelected" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import Sudoku from "../core/Sudoku/Sudoku";
import { FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import SudokuView from "../components/SudokuView.vue";
import { EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { usePlayStore } from "../stores/play";

const playStore = usePlayStore();
const { inputGrid, invalidPositions, selectedPosition } = storeToRefs(playStore);
const { setSelectedPosition, fillSelected, clearSelected } = playStore;

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
</script>
