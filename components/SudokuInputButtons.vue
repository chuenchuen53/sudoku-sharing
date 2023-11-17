<template>
  <div>
    <div class="grid grid-rows-2 grid-cols-5 gap-2">
      <button v-for="e in allElements" :key="e" @click="() => onElementBtnClick(e)" class="btn btn-square">{{ e }}</button>
      <button @click="onClearBtnClick" class="btn btn-square">Clear</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SudokuElement } from "../core/Sudoku/type";
import Sudoku from "~/core/Sudoku/Sudoku";

defineProps<{
  onElementBtnClick: (e: SudokuElement) => void;
  onClearBtnClick: () => void;
}>();

const allElements = Sudoku.allElements();
</script>
