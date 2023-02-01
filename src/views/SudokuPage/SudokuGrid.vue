<template>
  <div class="position-relative">
    <div id="hidden-sudoku-input">
      <input ref="inputRef" @keyup="handleKeyboard" :value="inputStr" />
    </div>
    <div id="sudoku-grid">
      <div class="sudoku-row" v-for="(row, rowIndex) in sudokuSolver.grid" :key="rowIndex">
        <div
          class="sudoku-cell"
          :class="{
            selected: selectedCell.rowIndex === rowIndex && selectedCell.columnIndex === columnIndex,
            relatedHighlight: selectionRelated[rowIndex][columnIndex],
            cellHighlight: highlight.cell.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
            invalid: highlight.invalid.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
            elementHighlight: highlight.element === cell.clue || highlight.element === cell.inputValue,
          }"
          v-for="(cell, columnIndex) in row"
          :key="columnIndex"
          @click="handleCellClick(rowIndex, columnIndex)"
        >
          <div v-if="cell.clue" class="clue">
            {{ cell.clue }}
          </div>
          <div v-else-if="cell.inputValue" class="input-value">
            {{ cell.inputValue }}
          </div>
          <div v-else-if="cell.candidates" class="candidates-container">
            <div
              v-for="(value, key) in cell.candidates"
              :key="key"
              class="candidate"
              :class="{
                hidden: !value,
                elementHighlight: highlight.element === key,
                candidateHighlight: highlight.candidate.some(
                  (x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex && x.value === key
                ),
                strikeThrough: removalOfCandidates.some(
                  (x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex && x.value === key
                ),
              }"
            >
              {{ key }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import { storeToRefs } from "pinia";
import ArrayUtil from "../../utils/ArrUtil";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";

interface SelectedCell {
  rowIndex: number;
  columnIndex: number;
}

const sudokuSolverStore = useSudokuSolverStore();
const { sudokuSolver, highlight, removalOfCandidates } = storeToRefs(sudokuSolverStore);
const { setInputValue, removeInputValue } = sudokuSolverStore;

const inputStr = ref("");
const selectedCell = reactive<SelectedCell>({
  rowIndex: 0,
  columnIndex: 0,
});

const inputRef = ref<HTMLInputElement | null>(null);

const handleCellClick = (rowIndex: number, columnIndex: number) => {
  selectedCell.rowIndex = rowIndex;
  selectedCell.columnIndex = columnIndex;
  if (inputRef.value && document.activeElement !== inputRef.value) inputRef.value.focus();
};

const selectionRelated = computed(() => {
  const highlightArr = ArrayUtil.create2DArray<boolean>(9, 9, false);
  sudokuSolver.value
    .getAllRelatedCells({
      rowIndex: selectedCell.rowIndex,
      columnIndex: selectedCell.columnIndex,
    })
    .forEach((cell) => (highlightArr[cell.rowIndex][cell.columnIndex] = true));
  return highlightArr;
});

const handleKeyboard = (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowUp":
      selectedCell.rowIndex = Math.max(0, selectedCell.rowIndex - 1);
      break;
    case "ArrowDown":
      selectedCell.rowIndex = Math.min(8, selectedCell.rowIndex + 1);
      break;
    case "ArrowLeft":
      selectedCell.columnIndex = Math.max(0, selectedCell.columnIndex - 1);
      break;
    case "ArrowRight":
      selectedCell.columnIndex = Math.min(8, selectedCell.columnIndex + 1);
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
      inputStr.value = e.key;
      setInputValue({ rowIndex: selectedCell.rowIndex, columnIndex: selectedCell.columnIndex, value: e.key });
      break;
    case "Backspace":
    case "Delete":
      inputStr.value = "";
      removeInputValue({ rowIndex: selectedCell.rowIndex, columnIndex: selectedCell.columnIndex });
      break;
  }
};
</script>

<style lang="scss" scoped>
@import "element-plus/theme-chalk/src/common/var";

$main-grid-color: #616161;
$sub-grid-color: #9e9e9e;
$clue-color: #424242;
$input-value-color: #1976d2;
$candidate-color: #9e9e9e;
$selected-bgcolor: var(--el-color-primary-light-5);
$selected-and-highlight-bgcolor: #cee38c;
$related-highlight-bgcolor: var(--el-color-primary-light-9);
$element-highlight-bgcolor: #fbf719;
$temp-cell-highlight-bgcolor: #fbf719;
$temp-candidate-highlight-bgcolor: #fbf719;
$invalid-cells-bgcolor: var(--el-color-danger-light-9);
$invalid-cells-color: var(--el-color-danger);

#hidden-sudoku-input {
  position: absolute;
  z-index: -1;

  input {
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
  }
}

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
      flex: 1 1 0;
      display: flex;
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

      &.relatedHighlight {
        background-color: $related-highlight-bgcolor;
      }

      &.cellHighlight {
        background-color: $temp-cell-highlight-bgcolor;
      }

      &.elementHighlight {
        background-color: $element-highlight-bgcolor;
      }

      &.selected {
        background-color: $selected-bgcolor;

        &.invalid {
          background-color: $selected-bgcolor;
        }

        &.elementHighlight,
        &.cellHighlight {
          background-color: $selected-and-highlight-bgcolor;
        }
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
      }

      .input-value {
        color: $input-value-color;
      }

      &.invalid {
        background-color: $invalid-cells-bgcolor;

        .input-value {
          color: $invalid-cells-color;
        }
      }

      .candidates-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        align-items: center;
        justify-items: center;

        .candidate {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          color: $candidate-color;
          width: 100%;
          height: 100%;

          &.hidden {
            visibility: hidden;
          }

          &.elementHighlight {
            background-color: $element-highlight-bgcolor;
          }

          &.candidateHighlight {
            background-color: $temp-candidate-highlight-bgcolor;
          }

          &.strikeThrough {
            text-decoration: line-through solid rgb(255 0 0 / 50%) 2px;
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

.position-relative {
  position: relative;
}
</style>
