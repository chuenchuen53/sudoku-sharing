<template>
  <div>
    <el-button-group>
      <el-button id="highlight-element-label" disabled>highlight</el-button>
      <el-button @click="() => setElementHighlight('0')">x</el-button>
      <el-button
        v-for="e in arrElements"
        :key="e"
        @click="() => setElementHighlight(e)"
        :type="highlight.element === e ? 'primary' : 'default'"
        >{{ e }}</el-button
      >
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import { storeToRefs } from "pinia";
import Sudoku from "@/Sudoku/Sudoku";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";

const sudokuSolverStore = useSudokuSolverStore();
const { highlight } = storeToRefs(sudokuSolverStore);
const { setElementHighlight } = sudokuSolverStore;

const arrElements = Sudoku.allElements();
</script>

<style lang="scss" scoped>
#highlight-element-label {
  color: var(--el-button-text-color);
  cursor: default;
}
</style>
