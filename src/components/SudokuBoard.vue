<template>
  <div id="board">
    <div
      class="sudoku-row"
      v-for="(row, rowIndex) in sudoku.puzzle"
      :key="rowIndex"
    >
      <div
        class="sudoku-cell"
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        @click="
          handleCellClick(rowIndex as SudokuIndex, colIndex as SudokuIndex)
        "
      >
        {{ cell.clue }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import Sudoku, { SudokuIndex } from "../Sudoku";

interface SelectedCell {
  row: SudokuIndex;
  col: SudokuIndex;
}

const selectedCell = reactive<SelectedCell>({
  row: 0,
  col: 0,
});
const sudoku = reactive(new Sudoku());

const handleCellClick = (rowIndex: SudokuIndex, colIndex: SudokuIndex) => {
  const row = sudoku.getRow(rowIndex);
  const col = sudoku.getColumn(colIndex);
  const box = sudoku.getBox(rowIndex, colIndex);

  console.table(row);
  console.table(col);
  console.table(box);

  selectedCell.row = rowIndex;
  selectedCell.col = colIndex;
};

const highlight = (rowIndex: SudokuIndex, colIndex: SudokuIndex) => {
  return (
    rowIndex === selectedCell.row ||
    colIndex === selectedCell.col ||
    sudoku.isInSameBox(rowIndex, colIndex, selectedCell.row, selectedCell.col)
  );
};
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
