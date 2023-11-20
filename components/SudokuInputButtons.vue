<template>
  <div class="grid grid-rows-2 grid-cols-5 gap-2 w-full place-content-center place-items-center">
    <button v-for="e in allElements" :key="e" @click="() => onElementBtnClick(e)" class="btn btn-square lg:btn-lg">{{ e }}</button>
    <button @click="onClearBtnClick" class="text-xl btn btn-square lg:btn-lg lg:text-2xl">
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
