<template>
  <div
    class="grid w-full grid-cols-5 grid-rows-2 place-content-center place-items-center gap-2"
    :class="[singleRowOnTabletSize && 'sm:max-lg:grid-cols-10 sm:max-lg:grid-rows-1', singleRowOnDesktopSize && 'lg:grid-cols-10 lg:grid-rows-1']"
  >
    <button v-for="e in allElements" :key="e" @click="() => onElementBtnClick(e)" class="btn btn-square">{{ e }}</button>
    <button @click="onClearBtnClick" class="btn btn-square text-xl" aria-label="clear">
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
