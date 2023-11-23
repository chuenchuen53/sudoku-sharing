<template>
  <div class="flex justify-center gap-10">
    <div class="flex flex-col items-center">
      <SudokuView
        :grid="inputGrid"
        :can-fill-data-arr="canFillData ? [canFillData] : []"
        :elimination-data-arr="canEliminateData ? [canEliminateData] : []"
        :invalid-positions="invalidPositions"
        :selected="selectedPosition"
        :on-cell-click="setSelectedPosition"
      />
      <div class="flex flex-col gap-4 relative pb-20 my-4 max-w-xl w-full">
        <SudokuInputButtons
          :on-element-btn-click="handleElementBtnClick"
          :on-clear-btn-click="handleClearBtnClick"
          single-row-on-tablet-size
          single-row-on-desktop-size
        />
        <div class="flex gap-2 justify-center">
          <button class="btn w-[135px]">
            Undo
            <IconRedo class="text-2xl" />
          </button>
          <button @click="toggleCandidatesMode" class="btn w-[135px] indicator">
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
      </div>
    </div>

    <HintDrawer />
    <div id="desktop-hint-container" class="hidden lg:block relative"></div>
  </div>
</template>

<script lang="ts" setup>
import SudokuView from "../components/SudokuView.vue";
import { usePlayStore } from "../stores/play";
import type { SudokuElement } from "~/core/Sudoku/type";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconRedo from "~/components/Icons/IconRedo.vue";
import HintDrawer from "~/components/HintDrawer.vue";

const playStore = usePlayStore();
const { candidatesMode, inputGrid, invalidPositions, selectedPosition, canFillData, canEliminateData } = storeToRefs(playStore);
const { setSelectedPosition, fillSelected, clearSelected, toggleCandidatesMode, toggleCandidateInSelectedCell } = playStore;

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
</script>
