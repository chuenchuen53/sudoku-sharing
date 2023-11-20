<template>
  <div class="grid grid-rows-2 grid-cols-5 gap-2 w-full place-content-center place-items-center sm:gap-4 lg:gap-2">
    <button v-for="e in allElements" :key="e" @click="() => onElementBtnClick(e)" class="btn btn-square sm:btn-lg lg:btn-md">{{ e }}</button>
    <button @click="onClearBtnClick" class="text-xl btn btn-square sm:btn-lg sm:text-2xl lg:btn-md lg:text-xl">
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
}>();

const allElements = Sudoku.allElements();
</script>
