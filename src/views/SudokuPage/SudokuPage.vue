<template>
  <div id="sudoku-page">
    <div class="left-container">
      <SudokuGrid
        :grid="s.grid"
        :highlight="highlight"
        :removal-of-candidates="removalOfCandidates"
        :get-all-related-cells="s.getAllRelatedCells.bind(s)"
        :set-input-value="setInputValue"
        :remove-input-value="removeInputValue"
      />
      <HighlightElementToggle
        :value="highlight.element"
        :on-change="setElementHighlight"
        :remove-all-highlight="removeAllHighlight"
        class="mt"
      />
      <div :style="{ width: '100%', 'margin-left': '18px', 'margin-top': '24px' }">
        <el-button @click="clearAllCandidates">clear candidates</el-button>
      </div>
    </div>
    <div class="right-container">
      <div class="d-flex">
        <SudokuHint
          class="mx"
          :get-unique-missing="getUniqueMissing"
          :get-basic-candidates="getBasicCandidates"
          :get-naked-singles="getNakedSingles"
          :get-hidden-singles="getHiddenSingles"
          :get-removal-due-to-locked-candidates="getRemovalDueToLockedCandidates"
          :get-removal-due-to-naked-pairs="getRemovalDueToNakedPairs"
        />
        <div>
          <StatsTable class="mx" :stats="s.stats" />
          <div class="solve-button-container">
            <el-button @click="() => s.trySolve()">try solve</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as tp from "@/samplePuzzle";
import { reactive, ref } from "vue";
import HighlightElementToggle from "../../components/HighlightElementToggle.vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import SudokuGrid from "../../components/SudokuGrid.vue";
import SudokuHint from "../../components/SudokuHint.vue";
import StatsTable from "@/components/StatsTable.vue";
import { VirtualLineType } from "@/Sudoku/type";
import type { Highlight } from "@/views/SudokuPage/type";
import type { CellWithIndex, InputValueData, SudokuElementWithZero } from "@/Sudoku/type";

const s = reactive(new SudokuSolver(tp.p1));
const highlight = ref<Highlight>({
  element: "0",
  cell: [],
  candidate: [],
  invalid: [],
});

const removalOfCandidates = ref<InputValueData[]>([]);

const removeAllHighlight = () => {
  highlight.value.element = "0";
  highlight.value.cell = [];
  highlight.value.candidate = [];
};

const clearAllCandidates = () => {
  s.clearAllCandidates();
};

const setElementHighlight = (value: SudokuElementWithZero) => {
  if (highlight.value.element === value) {
    highlight.value.element = "0";
  } else {
    highlight.value.element = value;
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
  highlight.value.invalid = result;
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

const getBasicCandidates = () => {
  s.getBasicCandidates();
};

const getUniqueMissing = () => {
  const rowResult = s.getUniqueMissing(VirtualLineType.ROW);
  const columnResult = s.getUniqueMissing(VirtualLineType.COLUMN);
  const boxResult = s.getUniqueMissing(VirtualLineType.BOX);
  const cells = [...rowResult, ...columnResult, ...boxResult].map((x) => x.cell);
  highlight.value.cell = cells;
};

const getNakedSingles = () => {
  const result = s.getNakedSingles();
  console.log("file: SudokuPage.vue ~ line 110 ~ getNakedSingles ~ result", result);
  highlight.value.candidate = result;
};

const getHiddenSingles = () => {
  const result = s.getHiddenSingles();
  highlight.value.candidate = result;
};

const getRemovalDueToLockedCandidates = () => {
  const result = s.getRemovalDueToLockedCandidates();
  removalOfCandidates.value = result;
};

const getRemovalDueToNakedPairs = () => {
  const result = s.getRemovalDueToNakedPairs();
  removalOfCandidates.value = result;
};
</script>

<style scoped>
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

.d-flex {
  display: flex;
  justify-content: space-between;
}

.solve-button-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  width: 100%;
}

#sudoku-page {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}
</style>
