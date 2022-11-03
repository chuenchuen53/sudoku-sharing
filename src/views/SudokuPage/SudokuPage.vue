<template>
  <div>
    <SudokuGrid
      :grid="s.grid"
      :highlight="highlight"
      :get-all-related-cells="s.getAllRelatedCells.bind(s)"
      :set-input-value="setInputValue"
      :remove-input-value="removeInputValue"
    />
    <HighlightElementToggle :highlight="highlight.element" :set-highlight="setElementHighlight" />
  </div>
</template>

<script setup lang="ts">
import * as tp from "@/samplePuzzle";
import {
  VirtualLineType,
  type Cell,
  type CellWithIndex,
  type InputValueData,
  type SudokuElement,
  type SudokuElementWithZero,
} from "@/Sudoku/type";
import { reactive, computed, ref } from "vue";
import Sudoku from "../../Sudoku";
import ArrayUtil from "../../utils/ArrayUtil";
import HighlightElementToggle from "../../components/HighlightElementToggle.vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import SudokuGrid from "../../components/SudokuGrid.vue";
import type { Highlight } from "@/views/SudokuPage/type";

const s = reactive(new SudokuSolver(tp.testingPuzzle0));

const highlight = reactive<Highlight>({
  element: "0",
  cell: [],
  candidate: [],
  invalid: [],
});

const setElementHighlight = (value: SudokuElementWithZero) => {
  if (highlight.element === value) {
    highlight.element = "0";
  } else {
    highlight.element = value;
  }
};

const updateInvalidHighlight = () => {
  const arr = [
    ...s.validateDetail[VirtualLineType.ROW],
    ...s.validateDetail[VirtualLineType.COLUMN],
    ...s.validateDetail[VirtualLineType.BOX],
  ];
  const result = arr
    .map((x) => x.duplicatedCells)
    .filter((x) => x.length)
    .flat(1);
  console.log("file: Sudoku.vue ~ line 61 ~ updateInvalidHighlight ~ result", result);
  highlight.invalid = result;
};

const setInputValue = (data: InputValueData) => {
  if (s.grid[data.rowIndex][data.columnIndex].clue) return;
  s.setInputValue(data, true);
  updateInvalidHighlight();
};

const removeInputValue = (data: CellWithIndex) => {
  if (s.grid[data.rowIndex][data.columnIndex].clue) return;
  s.removeInputValue(data, true);
  updateInvalidHighlight();
};

// const removeHighlight = () => {
//   tempCellHighlight.value = [];
//   tempCandidateHighlight.value = [];
// };

// const clearAllCandidates = () => {
//   s.clearAllCandidates();
// };

// const getBasicCandidates = () => {
//   s.getBasicCandidates();
// };

// const getUniqueMissing = () => {
//   const rowResult = s.getUniqueMissing(VirtualLineType.ROW);
//   const columnResult = s.getUniqueMissing(VirtualLineType.COLUMN);
//   const boxResult = s.getUniqueMissing(VirtualLineType.BOX);
//   const cells = [...rowResult, ...columnResult, ...boxResult].map((x) => x.cell);
//   tempCellHighlight.value = cells;
// };

// const getNakedSingles = () => {
//   const result = s.getNakedSingles();
//   tempCandidateHighlight.value = result;
// };

// const getHiddenSingles = () => {
//   const result = s.getHiddenSingles();
//   tempCandidateHighlight.value = result;
// };
</script>

<style scoped></style>
