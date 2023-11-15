<template>
  <div>this is solver page</div>
  <div class="">hi</div>
  <SudokuView :grid="sudoku.grid" :can-fill-data-arr="canFill" :elimination-data-arr="eliminationDataArr" :invalid-positions="[]" />
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import Sudoku from "../core/Sudoku/Sudoku";
import { FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import SudokuView from "~/components/SudokuView.vue";
import { EliminationStrategyType } from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";

const sudoku = new Sudoku([
  ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
  ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
  ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
  ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
  ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
  ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
  ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
  ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
]);

const sudokuSolver = new SudokuSolver(sudoku);
sudokuSolver.setBasicCandidates();

sudoku.setInputValue({ rowIndex: 0, columnIndex: 2, value: "1" }, false);
sudoku.setInputValue({ rowIndex: 0, columnIndex: 7, value: "3" }, false);

const canFill0 = sudokuSolver.computeCanFill(FillStrategyType.UNIQUE_MISSING);
const canFill1 = sudokuSolver.computeCanFill(FillStrategyType.NAKED_SINGLE);
const canFill = [...canFill0, ...canFill1];

const eliminationDataArr0 = sudokuSolver.computeCanEliminate(EliminationStrategyType.NAKED_PAIRS);
const eliminationDataArr1 = sudokuSolver.computeCanEliminate(EliminationStrategyType.Y_WING);

const eliminationDataArr = [...eliminationDataArr0, ...eliminationDataArr1];
</script>

<style></style>
