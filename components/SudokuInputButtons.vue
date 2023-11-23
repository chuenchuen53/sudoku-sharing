<template>
  <div
    class="grid grid-rows-2 grid-cols-5 gap-2 w-full place-content-center place-items-center"
    :class="[singleRowOnTabletSize && 'sm:max-lg:grid-rows-1 sm:max-lg:grid-cols-10', singleRowOnDesktopSize && 'lg:grid-rows-1 lg:grid-cols-10']"
  >
    <button v-for="e in allElements" :key="e" @click="() => onElementBtnClick(e)" class="btn btn-square">{{ e }}</button>
    <button @click="onClearBtnClick" class="text-xl btn btn-square">
      <IconEraser />
    </button>
  </div>
</template>

<script lang="ts" setup>
import Sudoku from "../core/Sudoku/Sudoku";
import IconEraser from "./Icons/IconEraser.vue";
import type { SudokuElement } from "../core/Sudoku/type";

defineProps<{
  onElementBtnClick: (e: SudokuElement) => void;
  onClearBtnClick: () => void;
  singleRowOnTabletSize: boolean;
  singleRowOnDesktopSize: boolean;
}>();

const allElements = Sudoku.allElements();
</script>
