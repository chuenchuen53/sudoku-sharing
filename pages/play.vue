<template>
  <div class="flex flex-col items-center w-full">
    <SudokuView
      :grid="inputGrid"
      :can-fill-data-arr="canFillData ? [canFillData] : []"
      :elimination-data-arr="canEliminateData ? [canEliminateData] : []"
      :invalid-positions="invalidPositions"
      :selected="selectedPosition"
      :on-cell-click="setSelectedPosition"
    />
    <div class="flex flex-col lg:flex-row gap-8 relative pb-20 my-8">
      <SudokuInputButtons :on-element-btn-click="fillSelected" :on-clear-btn-click="clearSelected" />
      <div>
        <button @click="toggleCandidatesMode" class="btn relative">
          Note
          <IconPencil class="text-xl" />
          <div
            class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 badge badge-sm"
            :class="{
              'badge-primary': candidatesMode,
              'badge-neutral': !candidatesMode,
            }"
          >
            {{ candidatesMode ? "ON" : "OFF" }}
          </div>
        </button>
        <button @click="fillBasicCandidates" class="btn">Fill Candidates</button>
      </div>
    </div>
    <div class="fixed top-24 right-6 flex flex-col">
      <div>hint</div>
      <button v-for="(x, index) in SudokuSolver.enabledFillStrategies" :key="index" @click="() => computeFillInputValueData(x)" class="btn">
        {{ FillStrategy.strategyName(x) }}
      </button>
      <div v-for="(x, index) in fillInputValueData" :key="index">
        <button @click="() => setCanFillData(x.data)" class="btn">{{ x.description }}</button>
      </div>
    </div>
    <div class="fixed top-24 left-6 flex flex-col">
      <button v-for="(x, index) in SudokuSolver.enabledEliminationStrategies" :key="index" @click="() => computeEliminateData(x)" class="btn">
        {{ EliminationStrategy.strategyName(x) }}
      </button>
      <div v-if="eliminateData">
        <div v-for="(x, index) in eliminateData" :key="index">
          <button @click="() => setCanEliminateData(x.data)" class="btn">
            {{ x.description }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import Sudoku from "../core/Sudoku/Sudoku";
import FillStrategy, { FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import SudokuView from "../components/SudokuView.vue";
import EliminationStrategy, { EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { usePlayStore } from "../stores/play";
import IconPencil from "~/components/Icons/IconPencil.vue";

const playStore = usePlayStore();
const { candidatesMode, inputGrid, invalidPositions, selectedPosition, fillInputValueData, canFillData, eliminateData, canEliminateData } =
  storeToRefs(playStore);
const {
  setSelectedPosition,
  fillSelected,
  clearSelected,
  toggleCandidatesMode,
  toggleCandidateInSelectedCell,
  fillBasicCandidates,
  computeFillInputValueData,
  setCanFillData,
  computeEliminateData,
  setCanEliminateData,
} = playStore;

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
      if (candidatesMode.value) {
        toggleCandidateInSelectedCell(e.key);
      } else {
        fillSelected(e.key);
      }
      break;
    case "Backspace":
    case "Delete":
      if (candidatesMode.value) break;
      clearSelected();
      break;
    case "n":
      toggleCandidatesMode();
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
