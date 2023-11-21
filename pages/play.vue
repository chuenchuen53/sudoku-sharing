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
    <div class="flex flex-col lg:flex-row gap-4 relative pb-20 my-4 max-x-[466px] w-full">
      <SudokuInputButtons :on-element-btn-click="handleElementBtnClick" :on-clear-btn-click="handleClearBtnClick" />
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

      <div class="flex justify-center gap-2">
        <details ref="detailsRef" class="dropdown dropdown-end fixed top-3 z-[1001] right-6">
          <summary class="btn">
            Hint
            <IconLightBulb class="text-xl text-warning" />
          </summary>
          <div
            class="p-6 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-[330px] h-[calc(100vh-76px)] overflow-x-hidden overflow-y-auto overscroll-none"
          >
            <div>
              <button @click="handleFillBasicCandidates" class="btn btn-sm">
                Help Fill Notes
                <IconPencil class="text-xl" />
              </button>

              <div class="divider"></div>

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

              <div class="divider"></div>

              <HintResponse
                :fill-strategy="currentFillStrategy"
                :fill-input-value-data="fillInputValueData"
                :on-fill-data-click="handleFillDataClick"
                :elimination-strategy="currentEliminationStrategy"
                :elimination-data="eliminateData"
                :on-elimination-data-click="handleEliminateDataClick"
              />
            </div>
          </div>
        </details>
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
import type { EliminationData, EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillInputValueData, FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import type { SudokuElement } from "~/core/Sudoku/type";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconRedo from "~/components/Icons/IconRedo.vue";
import IconLightBulb from "~/components/Icons/IconLightBulb.vue";

const playStore = usePlayStore();
const {
  candidatesMode,
  inputGrid,
  invalidPositions,
  selectedPosition,
  fillInputValueData,
  canFillData,
  eliminateData,
  canEliminateData,
  currentFillStrategy,
  currentEliminationStrategy,
} = storeToRefs(playStore);
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

const handleFillBasicCandidates = () => {
  fillBasicCandidates();
  if (detailsRef.value) detailsRef.value.open = false;
};

const handleFillStrategyHintClick = (x: FillStrategyType) => {
  computeFillInputValueData(x);
};

const handleEliminateStrategyHintClick = (x: EliminationStrategyType) => {
  computeEliminateData(x);
};

const handleElementBtnClick = (x: SudokuElement) => {
  if (candidatesMode.value) {
    toggleCandidateInSelectedCell(x);
  } else {
    fillSelected(x);
  }
};

const handleClearBtnClick = () => {
  if (candidatesMode.value) return;
  clearSelected();
};

const handleFillDataClick = (data: FillInputValueData) => {
  setCanFillData(data);
  if (detailsRef.value) detailsRef.value.open = false;
};

const handleEliminateDataClick = (data: EliminationData) => {
  setCanEliminateData(data);
  if (detailsRef.value) detailsRef.value.open = false;
};
</script>
