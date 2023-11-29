<template>
  <div class="flex w-full justify-center gap-10">
    <div class="flex w-full max-w-xl flex-col items-center">
      <div class="relative">
        <SudokuView
          :grid="inputGrid"
          :can-fill-data-arr="canFillData ? [canFillData] : []"
          :elimination-data-arr="canEliminateData ? [canEliminateData] : []"
          :invalid-positions="invalidPositions"
          :selected="selectedPosition"
          :on-cell-click="setSelectedPosition"
        />
        <div class="absolute left-0 top-0 z-10 h-full w-full bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20" v-if="showSolvedUi">
          <div
            class="secondary-text-shadow absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-primary bg-opacity-10 p-4 text-4xl font-bold drop-shadow-md backdrop-blur-sm"
          >
            YOU DID IT!
          </div>
          <Confetti />
        </div>
      </div>
      <div class="relative mb-4 mt-8 flex w-full flex-col gap-4">
        <SudokuInputButtons
          :on-element-btn-click="handleElementBtnClick"
          :on-clear-btn-click="handleClearBtnClick"
          single-row-on-tablet-size
          single-row-on-desktop-size
        />
        <div class="flex justify-center gap-2">
          <button class="btn w-[135px]">
            Undo
            <IconRedo class="text-2xl" />
          </button>
          <button @click="toggleCandidatesMode" class="btn indicator w-[135px]">
            Note
            <IconPencil class="text-xl" />
            <div
              class="badge indicator-item badge-sm"
              :class="{
                'badge-primary': candidatesMode,
                'badge-neutral': !candidatesMode,
              }"
            >
              {{ candidatesMode ? "ON" : "OFF" }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="dropdown dropdown-end dropdown-bottom fixed right-28 top-3 z-[1001]">
      <label ref="newLabelRef" tabindex="0" class="btn btn-sm m-1">
        New
        <IconGrid class="text-xl text-accent" />
      </label>
      <ul tabindex="0" class="menu dropdown-content z-[1] w-28 rounded-box bg-base-100 p-2 shadow">
        <li><button @click="(e) => handleNewGameClick(e, 'easy')">easy</button></li>
        <li><button @click="(e) => handleNewGameClick(e, 'medium')">medium</button></li>
        <li><button @click="(e) => handleNewGameClick(e, 'hard')">hard</button></li>
        <li><button @click="(e) => handleNewGameClick(e, 'expert')">expert</button></li>
      </ul>
    </div>

    <HintDrawer />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import SudokuView from "../components/SudokuView.vue";
import { usePlayStore } from "../stores/play";
import type { InputClues, SudokuElement } from "~/core/Sudoku/type";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconGrid from "~/components/Icons/IconGrid.vue";
import IconRedo from "~/components/Icons/IconRedo.vue";
import HintDrawer from "~/components/HintDrawer.vue";
import SudokuInputUtil from "~/utils/SudokuInputUtil";
import Sudoku from "~/core/Sudoku/Sudoku";
import SudokuSolver from "~/core/Sudoku/SudokuSolver";
import { FillStrategyType } from "~/core/Sudoku/FillStrategy/FillStrategy";

const newLabelRef = ref<HTMLElement | null>(null);
const playStore = usePlayStore();
const { showSolvedUi, candidatesMode, inputGrid, invalidPositions, selectedPosition, canFillData, canEliminateData } = storeToRefs(playStore);
const { setSelectedPosition, fillSelected, clearSelected, toggleCandidatesMode, toggleCandidateInSelectedCell, initGridInFirstRender, newGame } =
  playStore;

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
  initGridInFirstRender();

  // testing
  const p0: InputClues = [
    ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
    ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
    ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
    ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
    ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
    ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
    ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
    ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
    ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
  ];

  const sudoku = new Sudoku(p0);
  const solver = new SudokuSolver(sudoku);
  solver.setValueFromFillStrategyWithNoCandidateFill(FillStrategyType.HIDDEN_SINGLE);

  const steps = solver.getSteps();
  console.log(steps);
  // testing
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

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

const handleNewGameClick = (event: MouseEvent, difficulty: "easy" | "medium" | "hard" | "expert") => {
  newGame(difficulty);
  (event.target as HTMLButtonElement).blur();
};
</script>

<style lang="scss" scoped>
.secondary-text-shadow {
  @apply text-base-100 dark:text-base-content;

  animation: secondary-text-shadow-animation 2s ease-in-out infinite alternate;
}

@keyframes secondary-text-shadow-animation {
  0% {
    text-shadow: oklch(var(--s)) 1px 0 5px;
  }

  100% {
    text-shadow: oklch(var(--s)) 1px 0 10px;
  }
}
</style>
