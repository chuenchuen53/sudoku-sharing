<template>
  <div id="sudoku-page">
    <div class="left-container">
      <div class="mb">
        <el-select :model-value="puzzle" @change="handleSelectPuzzle" class="m-2" placeholder="Select" size="large">
          <el-option v-for="item in options" :key="item.key" :label="item.label" :value="item.value" />
        </el-select>
      </div>
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
import { ref } from "vue";
import { ElButton } from "element-plus";
import { storeToRefs } from "pinia";
import samplePuzzles from "../../samplePuzzle";
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
const { newSudoku } = sudokuSolverStore;

const puzzle = ref("p0");

const options = [
  {
    key: 0,
    value: "p0",
    label: "naked single",
  },
  {
    key: 1,
    value: "p1",
    label: "hidden single",
  },
  {
    key: 2,
    value: "p2",
    label: "locked candidate",
  },
  {
    key: 3,
    value: "p0",
    label: "naked pairs",
  },
  {
    key: 4,
    value: "p4",
    label: "Option5",
  },
];

const clueMap = {
  p0: samplePuzzles.p0,
  p1: samplePuzzles.p1,
  p2: samplePuzzles.p2,
  p3: samplePuzzles.p3,
  p4: samplePuzzles.p4,
  p5: samplePuzzles.p5,
  p6: samplePuzzles.p6,
};

const handleSelectPuzzle = (value: string) => {
  console.log("file: SudokuPage.vue:85 ~ handleSelectPuzzle ~ value", value);
  puzzle.value = value;
  if (value in clueMap) {
    const key = value as keyof typeof clueMap;
    newSudoku(clueMap[key]);
  }
};
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

  .mb {
    margin-bottom: 24px;
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
