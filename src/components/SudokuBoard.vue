<template>
  <div>
    <div id="sudoku-grid">
      <div class="sudoku-row" v-for="(row, rowIndex) in s.grid" :key="rowIndex">
        <div
          class="sudoku-cell"
          :class="{
            highlight: highlight[rowIndex][colIndex],
            selected: selectedCell.row === rowIndex && selectedCell.col === colIndex,
            tempHighlight: tempCellHighlight.some((x) => x.rowIndex === rowIndex && x.columnIndex === colIndex),
          }"
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          @click="handleCellClick(rowIndex, colIndex)"
        >
          <div
            v-if="cell.clue"
            class="clue"
            :class="{
              elementHighlight: elementHighlight === cell.clue,
            }"
          >
            {{ cell.clue }}
          </div>
          <div
            v-else-if="cell.inputValue"
            class="input-value"
            :class="{
              elementHighlight: elementHighlight === cell.inputValue,
            }"
          >
            {{ cell.inputValue }}
          </div>
          <div v-else-if="cell.candidates" class="candidate-container">
            <div
              v-for="(value, key) in cell.candidates"
              :key="key"
              class="candidate"
              :class="{
                hidden: !value,
                elementHighlight: elementHighlight === key,
                tempHighlight: tempCandidateHighlight.some(
                  (x) => x.rowIndex === rowIndex && x.columnIndex === colIndex && x.value === key
                ),
              }"
            >
              {{ key }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <section>
      <div>
        <input
          ref="inputRef"
          @keyup="handleKeyboard"
          :value="inputStr"
          @input="(event) => (event.target!.value = inputStr)"
        />
      </div>
    </section>
    <section>numberOfClues: {{ s.numberOfClues }}</section>
    <section>is valid: {{ s.isValid }}</section>
    <section>
      <el-button @click="removeHighlight">remove highlight</el-button>
      <el-button @click="clearAllCandidates">clear all candidates</el-button>
      <el-button @click="getBasicCandidates">get basic candidates</el-button>
      <el-button @click="getUniqueMissing">get Unique Missing Candidate</el-button>
      <el-button @click="getNakedSingles">get naked singles</el-button>
      <el-button @click="getHiddenSingles">get hidden singles</el-button>
      <!-- todo -->
      <!-- <el-button @click="sudoku.trySolve">try solve</el-button> -->
    </section>
    <section><HighlightElementToggle :highlight="elementHighlight" :set-highlight="setElementHighlight" /></section>
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
import Sudoku from "../Sudoku";
import ArrayUtil from "../utils/ArrayUtil";
import HighlightElementToggle from "./HighlightElementToggle.vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import SudokuSolver from "@/Sudoku/SudokuSolver";

interface SelectedCell {
  row: number;
  col: number;
}

const inputStr = ref("");

const selectedCell = reactive<SelectedCell>({
  row: 0,
  col: 0,
});
const s = reactive(new SudokuSolver(tp.testingPuzzle0));

const inputRef = ref<HTMLInputElement | null>(null);

const elementHighlight = ref<SudokuElementWithZero>("0");
const tempCellHighlight = ref<CellWithIndex[]>([]);
const tempCandidateHighlight = ref<InputValueData[]>([]);

const setElementHighlight = (value: SudokuElementWithZero) => {
  if (elementHighlight.value === value) {
    elementHighlight.value = "0";
  } else {
    elementHighlight.value = value;
  }
};

const handleCellClick = (rowIndex: number, colIndex: number) => {
  selectedCell.row = rowIndex;
  selectedCell.col = colIndex;
  if (inputRef.value && document.activeElement !== inputRef.value) {
    inputRef.value.focus();
  }
};

const removeHighlight = () => {
  tempCellHighlight.value = [];
  tempCandidateHighlight.value = [];
};

const clearAllCandidates = () => {
  s.clearAllCandidates();
};

const getBasicCandidates = () => {
  s.getBasicCandidates();
};

const getUniqueMissing = () => {
  const rowResult = s.getUniqueMissing(VirtualLineType.ROW);
  const columnResult = s.getUniqueMissing(VirtualLineType.COLUMN);
  const boxResult = s.getUniqueMissing(VirtualLineType.BOX);
  const cells = [...rowResult, ...columnResult, ...boxResult].map((x) => x.cell);
  tempCellHighlight.value = cells;
};

const getNakedSingles = () => {
  const result = s.getNakedSingles();
  tempCandidateHighlight.value = result;
};

const getHiddenSingles = () => {
  const result = s.getHiddenSingles();
  tempCandidateHighlight.value = result;
};

const highlight = computed(() => {
  const highlightArr = ArrayUtil.create2DArray<boolean>(9, 9, false);
  const allCellsInRelatedVirtualLines = s.getAllRelatedCells({
    rowIndex: selectedCell.row,
    columnIndex: selectedCell.col,
  });
  allCellsInRelatedVirtualLines.forEach((cell) => {
    highlightArr[cell.rowIndex][cell.columnIndex] = true;
  });
  return highlightArr;
});

const setInputValue = (value: SudokuElement) => {
  const rowIndex = selectedCell.row;
  const columnIndex = selectedCell.col;
  if (s.grid[rowIndex][columnIndex].clue) return;
  s.setInputValue({ rowIndex, columnIndex, value }, true);
};

const removeInputValue = () => {
  const rowIndex = selectedCell.row;
  const columnIndex = selectedCell.col;
  if (s.grid[rowIndex][columnIndex].clue) return;
  s.removeInputValue({ rowIndex, columnIndex }, true);
};

const handleKeyboard = (e: KeyboardEvent) => {
  const key = e.key;

  switch (key) {
    case "ArrowUp":
      selectedCell.row = Math.max(0, selectedCell.row - 1);
      break;
    case "ArrowDown":
      selectedCell.row = Math.min(8, selectedCell.row + 1);
      break;
    case "ArrowLeft":
      selectedCell.col = Math.max(0, selectedCell.col - 1);
      break;
    case "ArrowRight":
      selectedCell.col = Math.min(8, selectedCell.col + 1);
      break;
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      inputStr.value = key;
      setInputValue(key as SudokuElement);
      break;
    case "Backspace":
    case "Delete":
      inputStr.value = "";
      removeInputValue();
      break;
  }
};
</script>

<style lang="scss" scoped>
$main-grid-color: #616161;
$sub-grid-color: #9e9e9e;
$clue-color: #424242;
$input-value-color: #1976d2;
$candidate-color: #9e9e9e;
$selected-bgcolor: #c1dcf8;
$related-highlight-bgcolor: #e4ebf2;
$element-highlight-bgcolor: #ffd700;
$temp-cell-highlight-bgcolor: #ffd700;
$temp-candidate-highlight-bgcolor: #ffd700;

#sudoku-grid {
  display: flex;
  flex-direction: column;
  border: 3px $main-grid-color solid;
  width: 450px;
  height: 450px;

  .sudoku-row {
    display: flex;
    flex: 1 1 0;

    .sudoku-cell {
      display: flex;
      flex: 1 1 0;
      justify-content: center;
      align-items: center;
      border: 1px $sub-grid-color solid;
      font-size: 30px;

      &:nth-child(1) {
        border-left: none;
      }

      &:nth-child(9) {
        border-right: none;
      }

      &:nth-child(3),
      &:nth-child(6) {
        border-right: 1.5px $main-grid-color solid;
      }

      &:nth-child(4),
      &:nth-child(7) {
        border-left: 1.5px $main-grid-color solid;
      }

      &.highlight {
        background-color: $related-highlight-bgcolor;
      }

      &.tempHighlight {
        background-color: $temp-cell-highlight-bgcolor;
      }

      &.selected {
        background-color: $selected-bgcolor;
      }

      .clue,
      .input-value {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .clue {
        color: $clue-color;

        &.elementHighlight {
          background-color: $element-highlight-bgcolor;
        }
      }

      .input-value {
        color: $input-value-color;

        &.elementHighlight {
          background-color: $element-highlight-bgcolor;
        }
      }

      .candidate-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        align-items: center;
        justify-items: center;

        .candidate {
          font-size: 10px;
          color: $candidate-color;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          &.hidden {
            visibility: hidden;
          }

          &.elementHighlight {
            background-color: $element-highlight-bgcolor;
          }

          &.tempHighlight {
            background-color: $temp-candidate-highlight-bgcolor;
          }
        }
      }
    }

    &:nth-child(1) {
      .sudoku-cell {
        border-top: none;
      }
    }

    &:nth-child(9) {
      .sudoku-cell {
        border-bottom: none;
      }
    }

    &:nth-child(3),
    &:nth-child(6) {
      .sudoku-cell {
        border-bottom: 1.5px $main-grid-color solid;
      }
    }

    &:nth-child(4),
    &:nth-child(7) {
      .sudoku-cell {
        border-top: 1.5px $main-grid-color solid;
      }
    }
  }
}
</style>
