<template>
  <div id="sudoku-page">
    <div class="left-container">
      <SudokuGrid />
      <div class="flex-column mt">
        <HighlightElementToggle />
        <HighlightCellToggle />
      </div>
      <ClearGridAssistance class="mt" />
    </div>
    <div class="right-container">
      <SudokuHint class="mx" />
      <EliminateCandidate class="mx" />
      <div>
        <StatsTable class="mx" />
        <div class="solve-button-container">
          <el-button @click="() => sudokuSolver.trySolve()">try solve</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import { storeToRefs } from "pinia";
import HighlightCellToggle from "./HighlightCellToggle.vue";
import HighlightElementToggle from "./HighlightElementToggle.vue";
import ClearGridAssistance from "./ClearGridAssistance.vue";
import SudokuGrid from "./SudokuGrid.vue";
import SudokuHint from "./SudokuHint.vue";
import EliminateCandidate from "./EliminateCandidate.vue";
import StatsTable from "@/views/SudokuPage/StatsTable.vue";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";
import "element-plus/es/components/button/style/css";

const sudokuSolverStore = useSudokuSolverStore();
const { sudokuSolver } = storeToRefs(sudokuSolverStore);
</script>

<style lang="scss" scoped>
#sudoku-page {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;

  .flex-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mt {
    margin-top: 24px;
  }

  .mx {
    margin-left: 24px;
    margin-right: 24px;
  }

  .left-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .right-container {
    display: flex;
    justify-content: space-between;
  }

  .solve-button-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    width: 100%;
  }
}
</style>
