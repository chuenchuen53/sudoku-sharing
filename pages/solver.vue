<template>
  <div class="my-8">
    <div class="text-xl">Solve</div>
    <SudokuView :grid="puzzle" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
  </div>
  <div class="space-y-8">
    <SudokuStep v-for="(step, index) in sudokuSolver.steps" :key="index" :step-num="index + 1" :step="step" />
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import Sudoku from "../core/Sudoku/Sudoku";
import SudokuView from "../components/SudokuView.vue";
import SudokuStep from "../components/SudokuStep.vue";

const sudoku = new Sudoku([
  ["6", "0", "0", "1", "7", "0", "0", "0", "5"],
  ["0", "0", "0", "0", "4", "0", "0", "2", "0"],
  ["0", "0", "0", "0", "0", "0", "8", "9", "0"],
  ["0", "3", "7", "8", "0", "0", "0", "0", "2"],
  ["5", "0", "0", "0", "0", "1", "0", "0", "9"],
  ["0", "0", "2", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "5", "0", "2", "4", "0", "0", "0"],
  ["0", "0", "0", "0", "1", "0", "6", "0", "0"],
  ["7", "0", "0", "3", "0", "0", "0", "0", "0"],
]);

const puzzle = Sudoku.cloneGrid(sudoku.grid);

const sudokuSolver = new SudokuSolver(sudoku);
sudokuSolver.trySolve();
</script>

<style></style>
