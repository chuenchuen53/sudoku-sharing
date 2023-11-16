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

$selected-bgcolor: var(--el-color-primary-light-5);
$selected-and-highlight-bgcolor: #cee38c;
$invalid-cells-bgcolor: var(--el-color-danger-light-9);
$grand-border-width: 3px;
$main-border-width: 2px;
$sub-border-width: 1px;

.sudoku-view {
  --cell-font-size: 25px;
  --candidate-font-size: 8px;
  --cell-size: calc((100vw - 64px) / 9);
  --cell-size-with-sub-border: calc(var(--cell-size) + #{$sub-border-width});
  --cell-size-with-main-border: calc(var(--cell-size) + #{$main-border-width});
  --puzzle-size: calc(9 * var(--cell-size) + 2 * #{$grand-border-width} + 2 * #{$main-border-width} + 6 * #{$sub-border-width});
  --main-grid-color: #262626;
  --sub-grid-color: #52525b;

  @media (prefers-color-scheme: dark) {
    --main-grid-color: #f4f4f5;
    --sub-grid-color: #d4d4d8;
  }

  @media (width >= 640px) {
    --cell-size: 50px;
    --cell-font-size: 30px;
    --candidate-font-size: 10px;
  }

  @apply bg-base-100 dark:bg-base-100;
  @apply border-base-content dark:border-slate-50;

  display: flex;
  flex-direction: column;
  border-width: $grand-border-width;
  border-style: solid;
  width: var(--puzzle-size);
  height: var(--puzzle-size);

  .sudoku-row {
    display: flex;
    flex: 1 1 auto;

    .sudoku-cell {
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: $sub-border-width var(--sub-grid-color) solid;
      border-bottom: $sub-border-width var(--sub-grid-color) solid;
      width: var(--cell-size-with-sub-border);
      height: var(--cell-size-with-sub-border);
      overflow: hidden;

      &:nth-child(9) {
        border-right: none;
        width: var(--cell-size);
      }

      &:nth-child(3),
      &:nth-child(6) {
        border-right: $main-border-width var(--main-grid-color) solid;
        width: var(--cell-size-with-main-border);
      }

      .clue,
      .input-value {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: var(--cell-font-size);
        line-height: 1;
      }

      .clue {
        @apply text-base-content dark:text-zinc-100;
      }

      .input-value {
        @apply text-primary dark:text-primary;
      }

      &.related-line-highlight {
        @apply bg-neutral-300 dark:bg-neutral-400 dark:bg-opacity-30;

        .input-value {
          @apply dark:text-[--primary-200];
        }
      }

      &.primary-cell-highlight {
        @apply bg-primary bg-opacity-60 dark:bg-primary dark:bg-opacity-100;
      }

      &.secondary-cell-highlight {
        @apply bg-secondary bg-opacity-30 dark:bg-secondary dark:bg-opacity-80;
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

        @apply text-[--primary-300] dark:text-[--primary-200];

        .candidate {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: var(--candidate-font-size);
          line-height: 1;
          width: 100%;
          height: 100%;
          position: relative;

          &.invisible {
            visibility: hidden;
          }

          &.highlight {
            @apply bg-accent dark:bg-accent;
            @apply text-accent-content dark:text-accent-content;
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
        border-bottom: $main-border-width var(--main-grid-color) solid;
        height: var(--cell-size-with-main-border);
      }
    }

    &:nth-child(9) {
      .sudoku-cell {
        border-bottom: none;
        height: var(--cell-size);
      }
    }
  }
}
</style>
