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
        <div
          v-else-if="
            cell.candidates ||
            (tempCandidates && tempCandidates.position.rowIndex === rowIndex && tempCandidates.position.columnIndex === columnIndex)
          "
          class="candidates-container"
        >
          <div
            v-for="value in tempCandidates && tempCandidates.position.rowIndex === rowIndex && tempCandidates.position.columnIndex === columnIndex
              ? mergeCandidates(cell.candidates, tempCandidates.element)
              : SudokuSolver.getCandidatesArr(cell.candidates!)"
            :key="value"
            class="candidate"
            :class="[
              `c${value}`,
              {
                highlight: highlightedCandidates
                  .filter((x) => x.position.rowIndex === rowIndex && x.position.columnIndex === columnIndex)
                  .some((x) => x.candidates[value]),
                eliminate: props.eliminationDataArr.some((x) =>
                  x.eliminations.some((y) => y.rowIndex === rowIndex && y.columnIndex === columnIndex && y.elements.includes(value)),
                ),
              },
            ]"
          >
            {{ value }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(x, index) in outlinedLines"
      :key="index"
      class="outlined-line"
      :class="`${x.topCls} ${x.leftCls} ${x.widthCls} ${x.heightCls}`"
    ></div>
  </div>
</template>

<script lang="ts" setup scoped>
import { SudokuLineUtil, type SudokuLine } from "../core/Sudoku/SudokuLine";
import Sudoku from "../core/Sudoku/Sudoku";
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import { VirtualLineType, type Grid, type Position, type SudokuElement, type Candidates } from "../core/Sudoku/type";

import type { FillInputValueData } from "~/core/Sudoku/FillStrategy/type";
import type { EliminationData, Highlight } from "~/core/Sudoku/EliminationStrategy/type";

const props = defineProps<{
  grid: Grid;
  canFillDataArr: FillInputValueData[];
  eliminationDataArr: EliminationData[];
  invalidPositions: Position[];
  outlinedLine?: SudokuLine;
  selected?: Position;
  tempCandidates?: { position: Position; element: SudokuElement };
  onCellClick?: (position: Position) => void;
}>();

const outlinedLines = computed<ReturnType<typeof outlinedLinePosition>[]>(() => {
  const { canFillDataArr } = props;
  const lines = new Set<SudokuLine>();
  canFillDataArr.forEach((data) => {
    if (data.secondaryHighlight && data.relatedLine) lines.add(data.relatedLine);
  });
  const linesArr = Array.from(lines);
  return linesArr.map((x) => outlinedLinePosition(x));
});

const relatedLinesCells = computed<Position[]>(() => {
  const { canFillDataArr, eliminationDataArr } = props;
  const relatedLines = new Set<SudokuLine>();
  canFillDataArr.forEach((data) => {
    if (data.relatedLine) relatedLines.add(data.relatedLine);
    if (data.secondaryRelatedLines) data.secondaryRelatedLines.forEach((line) => relatedLines.add(line));
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
  const { canFillDataArr, eliminationDataArr } = props;
  const primaryPositions: Position[] = [];
  const secondaryPositions: Position[] = [];
  canFillDataArr.forEach((data) => {
    if (data.highlightWholeCell) primaryPositions.push({ rowIndex: data.rowIndex, columnIndex: data.columnIndex });
    if (data.secondaryHighlight) secondaryPositions.push(...data.secondaryHighlight);
  });
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

function outlinedLinePosition(line: SudokuLine): {
  topCls: string;
  leftCls: string;
  widthCls: string;
  heightCls: string;
} {
  const { virtualLineType, lineIndex } = SudokuLineUtil.lineTypeAndIndex(line);
  switch (virtualLineType) {
    case VirtualLineType.ROW:
      return {
        topCls: `outline-top-${lineIndex}`,
        leftCls: `outline-left-0`,
        widthCls: `outline-full-width`,
        heightCls: `outline-one-cell-height`,
      };
    case VirtualLineType.COLUMN:
      return {
        topCls: `outline-top-0`,
        leftCls: `outline-left-${lineIndex}`,
        widthCls: `outline-one-cell-width`,
        heightCls: `outline-full-height`,
      };
    case VirtualLineType.BOX: {
      return {
        topCls: `outline-top-${Sudoku.boxFirstLineIndex(lineIndex, VirtualLineType.ROW)}`,
        leftCls: `outline-left-${Sudoku.boxFirstLineIndex(lineIndex, VirtualLineType.COLUMN)}`,
        widthCls: `outline-three-cells-width`,
        heightCls: `outline-three-cells-height`,
      };
    }
  }
}

function mergeCandidates(candidates: Candidates | undefined, tempElement: SudokuElement): SudokuElement[] {
  if (candidates) {
    const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
    candidatesArr.push(tempElement);
    return candidatesArr;
  } else {
    return [tempElement];
  }
}
</script>

<style lang="scss" scoped>
$grand-border-width: 3px;
$main-border-width: 2px;
$sub-border-width: 1px;

.sudoku-view {
  --cell-font-size: 25px;
  --candidate-font-size: 8px;
  --cell-size: calc(min(50px, (100vw - 64px) / 9));
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

  position: relative;
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

          &.c1 {
            grid-row: 1;
            grid-column: 1;
          }

          &.c2 {
            grid-row: 1;
            grid-column: 2;
          }

          &.c3 {
            grid-row: 1;
            grid-column: 3;
          }

          &.c4 {
            grid-row: 2;
            grid-column: 1;
          }

          &.c5 {
            grid-row: 2;
            grid-column: 2;
          }

          &.c6 {
            grid-row: 2;
            grid-column: 3;
          }

          &.c7 {
            grid-row: 3;
            grid-column: 1;
          }

          &.c8 {
            grid-row: 3;
            grid-column: 2;
          }

          &.c9 {
            grid-row: 3;
            grid-column: 3;
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

      &.related-line-highlight {
        @apply bg-neutral-300 dark:bg-neutral-400 dark:bg-opacity-30;

        .input-value {
          @apply dark:text-[--primary-200];
        }
      }

      &.primary-cell-highlight {
        @apply bg-primary bg-opacity-60 dark:bg-primary dark:bg-opacity-100;

        .input-value {
          @apply text-primary-content dark:text-primary-content;
        }

        .candidates-container {
          @apply text-primary-content dark:text-primary-content;
        }
      }

      &.secondary-cell-highlight {
        @apply bg-secondary bg-opacity-30 dark:bg-secondary dark:bg-opacity-80;

        .candidates-container {
          @apply text-black dark:text-secondary-content;
        }
      }

      &.selected {
        @apply bg-primary bg-opacity-25 dark:bg-opacity-[35%];

        &.invalid {
          @apply bg-primary bg-opacity-25 dark:bg-opacity-[35%];
        }

        &.primary-cell-highlight,
        &.secondary-cell-highlight {
          @apply bg-[--primary-600] dark:bg-[--primary-200];
        }
      }

      &.invalid {
        @apply bg-error bg-opacity-30;

        .input-value {
          @apply text-error;
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

  .outlined-line {
    $outline-width: 2px;

    position: absolute;
    outline-style: solid;
    outline-width: 3px;
    pointer-events: none;

    @apply outline-error;

    &.outline-top-0 {
      top: 0;
    }

    &.outline-top-1 {
      top: calc(var(--cell-size-with-sub-border));
    }

    &.outline-top-2 {
      top: calc(var(--cell-size-with-sub-border) * 2);
    }

    &.outline-top-3 {
      top: calc(var(--cell-size-with-sub-border) * 3 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-top-4 {
      top: calc(var(--cell-size-with-sub-border) * 4 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-top-5 {
      top: calc(var(--cell-size-with-sub-border) * 5 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-top-6 {
      top: calc(var(--cell-size-with-sub-border) * 6 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-top-7 {
      top: calc(var(--cell-size-with-sub-border) * 7 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-top-8 {
      top: calc(var(--cell-size-with-sub-border) * 8 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-left-0 {
      left: 0;
    }

    &.outline-left-1 {
      left: calc(var(--cell-size-with-sub-border));
    }

    &.outline-left-2 {
      left: calc(var(--cell-size-with-sub-border) * 2);
    }

    &.outline-left-3 {
      left: calc(var(--cell-size-with-sub-border) * 3 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-left-4 {
      left: calc(var(--cell-size-with-sub-border) * 4 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-left-5 {
      left: calc(var(--cell-size-with-sub-border) * 5 - #{$sub-border-width} + #{$main-border-width});
    }

    &.outline-left-6 {
      left: calc(var(--cell-size-with-sub-border) * 6 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-left-7 {
      left: calc(var(--cell-size-with-sub-border) * 7 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-left-8 {
      left: calc(var(--cell-size-with-sub-border) * 8 - 2 * #{$sub-border-width} + 2 * #{$main-border-width});
    }

    &.outline-one-cell-width {
      width: var(--cell-size);
    }

    &.outline-one-cell-height {
      height: var(--cell-size);
    }

    &.outline-three-cells-width {
      width: calc(var(--cell-size-with-sub-border) * 3 - #{$sub-border-width});
    }

    &.outline-three-cells-height {
      height: calc(var(--cell-size-with-sub-border) * 3 - #{$sub-border-width});
    }

    &.outline-full-width {
      width: calc(var(--puzzle-size) - 2 * #{$grand-border-width});
    }

    &.outline-full-height {
      height: calc(var(--puzzle-size) - 2 * #{$grand-border-width});
    }
  }
}
</style>
