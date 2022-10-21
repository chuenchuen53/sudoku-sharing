<template>
  <div>
    <div id="board">
      <div class="sudoku-row" v-for="(row, rowIndex) in sudoku.puzzle" :key="rowIndex">
        <div
          class="sudoku-cell"
          :class="{
            highlight: highlight[rowIndex][colIndex],
            selected: selectedCell.row === rowIndex && selectedCell.col === colIndex,
          }"
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          @click="handleCellClick(rowIndex, colIndex)"
        >
          <div v-if="cell.clue" class="clue">
            {{ cell.clue }}
          </div>
          <div v-else-if="cell.inputValue" class="input-value">
            {{ cell.inputValue }}
          </div>
          <div v-else-if="cell.candidates" class="candidate-container">
            <div v-for="(value, key) in cell.candidates" :key="key" class="candidate" :class="{ hidden: !value }">
              {{ key }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <section>is valid: {{ sudoku.isValid }}</section>
    <section>
      <button @click="clearAllCandidates">clear all candidates</button>
      <button @click="getRowMissing">get row missing</button>
      <button @click="getColumnMissing">get column missing</button>
      <button @click="getBoxMissing">get box missing</button>
      <button @click="getCombinedMissing">get combined missing</button>
      <button @click="getUniqueMissingCandidate">get Unique Missing Candidate</button>
      <button @click="sudoku.setUniqueMissingCandidateToInputValue">set Unique Missing Candidate</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import Sudoku from "../Sudoku";
import ArrayUtil from "../utils/ArrayUtil";

interface SelectedCell {
  row: number;
  col: number;
}

const selectedCell = reactive<SelectedCell>({
  row: 0,
  col: 0,
});
const sudoku = reactive(new Sudoku());

const handleCellClick = (rowIndex: number, colIndex: number) => {
  selectedCell.row = rowIndex;
  selectedCell.col = colIndex;
};

const clearAllCandidates = () => {
  sudoku.clearAllCandidates();
};

const getRowMissing = () => {
  for (let i = 0; i < 9; i++) {
    const row = sudoku.getRow(i);
    const missing = sudoku.missingInVirtualLine(row);
    row.forEach((x) => sudoku.setCandidates(x.rowIndex, x.columnIndex, missing));
  }
};

const getColumnMissing = () => {
  for (let i = 0; i < 9; i++) {
    const col = sudoku.getColumn(i);
    const missing = sudoku.missingInVirtualLine(col);
    col.forEach((x) => sudoku.setCandidates(x.rowIndex, x.columnIndex, missing));
  }
};

const getBoxMissing = () => {
  const allBoxes = sudoku.getAllBoxes();
  for (let i = 0; i < allBoxes.length; i++) {
    const box = allBoxes[i];
    const missing = sudoku.missingInVirtualLine(box);
    box.forEach((x) => sudoku.setCandidates(x.rowIndex, x.columnIndex, missing));
  }
};

const getCombinedMissing = () => {
  sudoku.getMissing();
};

const getUniqueMissingCandidate = () => {
  console.log(sudoku.getNakedSingles());
};

const highlight = computed(() => {
  const highlightArr = ArrayUtil.create2DArray<boolean>(9, 9, false);
  const allCellsInRelatedVirtualLines = sudoku.getAllCellsInRelatedVirtualLines(selectedCell.row, selectedCell.col);
  allCellsInRelatedVirtualLines.forEach((cell) => {
    highlightArr[cell.rowIndex][cell.columnIndex] = true;
  });
  return highlightArr;
});
</script>

<style lang="scss" scoped>
#board {
  display: flex;
  flex-direction: column;
  border: 2px black solid;
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
      border: 1px lightgrey solid;
      font-size: 30px;

      &:nth-child(3),
      &:nth-child(6) {
        border-right: 2px grey solid;
      }

      &.highlight {
        background-color: #e1fff0;

        &.selected {
          background-color: #c3dcfa;
        }
      }

      .clue {
        color: black;
      }

      .input-value {
        color: magenta;
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
          color: grey;
          &.hidden {
            visibility: hidden;
          }
        }
      }
    }

    &:nth-child(3),
    &:nth-child(6) {
      .sudoku-cell {
        border-bottom: 2px grey solid;
      }
    }
  }
}
</style>
