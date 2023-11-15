<template>
  <div class="sudoku-view">
    <div class="sudoku-row" v-for="(row, rowIndex) in props.grid" :key="rowIndex">
      <div
        class="sudoku-cell"
        :class="{
          'related-line-highlight': relatedLinesCells.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
          'primary-cell-highlight': highlightedCells.primary.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
          'secondary-cell-highlight': highlightedCells.secondary.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
          selected: props.selected && props.selected.rowIndex === rowIndex && props.selected.columnIndex === columnIndex,
          invalid: props.invalidPositions.some((x) => x.rowIndex === rowIndex && x.columnIndex === columnIndex),
        }"
        v-for="(cell, columnIndex) in row"
        :key="columnIndex"
        @click="props.onCellClick ? props.onCellClick({ rowIndex, columnIndex }) : undefined"
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
              invisible: !value,
              highlight: highlightedCandidates
                .filter((x) => x.position.rowIndex === rowIndex && x.position.columnIndex === columnIndex)
                .some((x) => x.candidates[key]),
              eliminate: props.eliminationDataArr.some((x) =>
                x.eliminations.some((y) => y.rowIndex === rowIndex && y.columnIndex === columnIndex && y.elements.includes(key)),
              ),
            }"
          >
            {{ key }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SudokuLineUtil, type SudokuLine } from "../core/Sudoku/SudokuLine";
import type { Highlight, EliminationData } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { Grid, Position } from "../core/Sudoku/type";
import type { FillInputValueData } from "../core/Sudoku/FillStrategy/FillStrategy";
import Sudoku from "~/core/Sudoku/Sudoku";

const props = defineProps<{
  grid: Grid;
  canFillDataArr: FillInputValueData[];
  eliminationDataArr: EliminationData[];
  invalidPositions: Position[];
  selected?: Position;
  onCellClick?: (position: Position) => void;
}>();

const relatedLinesCells = computed<Position[]>(() => {
  const { canFillDataArr, eliminationDataArr } = props;
  const relatedLines = new Set<SudokuLine>();
  canFillDataArr.forEach((data) => {
    if (data.relatedLine) relatedLines.add(data.relatedLine);
  });
  eliminationDataArr.forEach((data) => {
    if (data.relatedLines.length !== 0) {
      data.relatedLines.forEach((line) => {
        relatedLines.add(line);
      });
    }
  });

  const relatedLinesArr = Array.from(relatedLines);
  const positions: Position[] = relatedLinesArr.map((x) => SudokuLineUtil.allPositionsInLine(x)).flat();
  return Sudoku.removeDuplicatedPositions(positions);
});

const highlightedCells = computed<{ primary: Position[]; secondary: Position[] }>(() => {
  const { eliminationDataArr } = props;
  const primaryPositions: Position[] = [];
  const secondaryPositions: Position[] = [];
  eliminationDataArr.forEach((data) => {
    if (data.highlights.length !== 0) {
      data.highlights.forEach((x) => {
        if (x.isSecondaryPosition) {
          if (secondaryPositions.every((pos) => !Sudoku.isSamePos(x.position, pos))) secondaryPositions.push(x.position);
        } else if (primaryPositions.every((pos) => !Sudoku.isSamePos(x.position, pos))) {
          primaryPositions.push(x.position);
        }
      });
    }
  });
  return { primary: primaryPositions, secondary: secondaryPositions };
});

const highlightedCandidates = computed<Omit<Highlight, "isSecondaryPosition">[]>(() => {
  const { canFillDataArr, eliminationDataArr } = props;
  const highlighted: Omit<Highlight, "isSecondaryPosition">[] = [];
  canFillDataArr.forEach((data) => {
    const position = { rowIndex: data.rowIndex, columnIndex: data.columnIndex };
    const candidates = Sudoku.candidatesFactory(true, [data.value]);
    highlighted.push({ position, candidates });
  });

  eliminationDataArr.forEach((data) => {
    if (data.highlights.length !== 0) {
      data.highlights.forEach((x) => {
        highlighted.push({ position: x.position, candidates: x.candidates });
      });
    }
  });
  return highlighted;
});
</script>

<style lang="scss" scoped>
@import "element-plus/theme-chalk/src/common/var";

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
$large-border-width: 3px;
$medium-border-width: 2px;
$small-border-width: 1px;
$cell-size: 50px;
$cell-size-with-small-border: $cell-size + $small-border-width;
$cell-size-with-medium-border: $cell-size + $medium-border-width;

.sudoku-view {
  --main-grid-color: #262626;
  --sub-grid-color: #52525b;

  @media (prefers-color-scheme: dark) {
    --main-grid-color: #a3a3a3;
    --sub-grid-color: #737373;
  }

  @apply border-base-content;

  display: flex;
  flex-direction: column;
  border-width: $large-border-width;
  border-style: solid;
  width: calc(9 * #{$cell-size} + 2 * #{$large-border-width} + 2 * #{$medium-border-width} + 6 * #{$small-border-width});
  height: calc(9 * #{$cell-size} + 2 * #{$large-border-width} + 2 * #{$medium-border-width} + 6 * #{$small-border-width});

  .sudoku-row {
    display: flex;
    flex: 1 1 auto;

    .sudoku-cell {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: $small-border-width var(--sub-grid-color) solid;
      border-bottom: $small-border-width var(--sub-grid-color) solid;
      font-size: 30px;
      width: $cell-size-with-small-border;
      height: $cell-size-with-small-border;
      overflow: hidden;

      &:nth-child(9) {
        border-right: none;
        width: $cell-size;
      }

      &:nth-child(3),
      &:nth-child(6) {
        border-right: $medium-border-width var(--main-grid-color) solid;
        width: $cell-size-with-medium-border;
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
        @apply text-base-content;
      }

      &.related-line-highlight {
        @apply bg-[--accent-100] dark:bg-[--accent-200];

        .clue {
          @apply dark:text-accent-content dark:text-opacity-70;
        }
      }

      &.primary-cell-highlight {
        @apply bg-primary;
      }

      &.secondary-cell-highlight {
        @apply bg-secondary;
      }

      &.selected {
        background-color: $selected-bgcolor;

        &.invalid {
          background-color: $selected-bgcolor;
        }

        &.primary-cell-highlight,
        &.secondary-cell-highlight {
          background-color: $selected-and-highlight-bgcolor;
        }
      }

      .input-value {
        @apply text-[--primary-400] dark:text-[--primary-400];
      }

      &.invalid {
        background-color: $invalid-cells-bgcolor;

        .input-value {
          @apply text-error;
        }
      }

      .candidates-container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        place-items: center center;

        @apply text-[--primary-300] dark:text-[--primary-300];

        .candidate {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          width: 100%;
          height: 100%;
          position: relative;

          &.invisible {
            visibility: hidden;
          }

          &.highlight {
            @apply bg-accent dark:bg-[--accent-800];
            @apply text-accent-content dark:text-neutral-200;
          }

          &.eliminate {
            &::before {
              @apply bg-error;

              content: "";
              position: absolute;
              top: 50%;
              width: 85%;
              height: 1px;
              transform: rotate(135deg);
            }
          }
        }
      }
    }

    &:nth-child(3),
    &:nth-child(6) {
      .sudoku-cell {
        border-bottom: $medium-border-width var(--main-grid-color) solid;
        height: $cell-size-with-medium-border;
      }
    }

    &:nth-child(9) {
      .sudoku-cell {
        border-bottom: none;
        height: $cell-size;
      }
    }
  }
}
</style>
