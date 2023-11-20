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
    <div class="flex flex-col lg:flex-row gap-4 relative pb-20 my-4 max-x-[466px]">
      <SudokuInputButtons :on-element-btn-click="fillSelected" :on-clear-btn-click="clearSelected" />
      <div class="flex gap-2 justify-center">
        <button class="btn w-[135px] sm:btn-lg sm:w-[150px] lg:btn-md lg:w-[135px]">
          Undo
          <IconRedo class="text-2xl" />
        </button>
        <button @click="toggleCandidatesMode" class="btn w-[135px] sm:btn-lg sm:w-[150px] lg:btn-md lg:w-[135px] indicator">
          Note
          <IconPencil class="text-xl" />
          <div
            class="indicator-item badge badge-sm"
            :class="{
              'badge-primary': candidatesMode,
              'badge-neutral': !candidatesMode,
            }"
          >
            {{ candidatesMode ? "ON" : "OFF" }}
          </div>
        </button>
      </div>
      <div class="divider"></div>
      <div class="flex justify-center gap-2">
        <button @click="fillBasicCandidates" class="btn">
          Help Fill Notes
          <IconPencil class="text-xl" />
        </button>
        <details ref="detailsRef" class="dropdown dropdown-end">
          <summary class="btn">
            Hint
            <IconLightBulb class="text-xl text-warning" />
          </summary>
          <div class="mt-2 p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-[300px]">
            <div class="flex gap-4">
              <div class="flex flex-col gap-2">
                <button
                  v-for="(x, index) in SudokuSolver.enabledFillStrategies"
                  :key="index"
                  @click="() => handleFillStrategyHintClick(x)"
                  class="btn btn-sm whitespace-nowrap"
                >
                  {{ FillStrategy.strategyName(x) }}
                </button>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  v-for="(x, index) in SudokuSolver.enabledEliminationStrategies"
                  :key="index"
                  @click="() => handleEliminateStrategyHintClick(x)"
                  class="btn btn-sm whitespace-nowrap"
                >
                  {{ EliminationStrategy.strategyName(x) }}
                </button>
              </div>
            </div>
          </div>
        </details>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <div v-for="(x, index) in fillInputValueData" :key="index">
            <button @click="() => setCanFillData(x.data)" class="btn">{{ x.description }}</button>
          </div>
          <div v-if="eliminateData">
            <div v-for="(x, index) in eliminateData" :key="index">
              <button @click="() => setCanEliminateData(x.data)" class="btn">
                {{ x.description }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import FillStrategy from "../core/Sudoku/FillStrategy/FillStrategy";
import SudokuView from "../components/SudokuView.vue";
import EliminationStrategy from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { usePlayStore } from "../stores/play";
import type { EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconRedo from "~/components/Icons/IconRedo.vue";
import IconLightBulb from "~/components/Icons/IconLightBulb.vue";

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

const detailsRef = ref<HTMLDetailsElement | null>(null);

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

const handleFillStrategyHintClick = (x: FillStrategyType) => {
  computeFillInputValueData(x);
  if (detailsRef.value) detailsRef.value.open = false;
};

const handleEliminateStrategyHintClick = (x: EliminationStrategyType) => {
  computeEliminateData(x);
  if (detailsRef.value) detailsRef.value.open = false;
};
</script>
