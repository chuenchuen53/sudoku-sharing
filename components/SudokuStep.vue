<template>
  <div>
    <div v-if="'final' in step" class="text-lg">Solved</div>
    <div v-else class="text-lg">Step {{ stepNum }}</div>
    <div v-if="'fillCandidates' in step">
      <div>Fill in candidates</div>
      <SudokuView :grid="step.grid" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
    </div>
    <div v-else-if="'fill' in step">
      <div>Fill by {{ FillStrategy.strategyName(step.fill.strategy) }}</div>
      <SudokuView :grid="step.grid" :can-fill-data-arr="step.fill.data" :elimination-data-arr="[]" :invalid-positions="[]" />
    </div>
    <div v-else-if="'afterFill' in step">
      <div>Update candidates after fill</div>
      <SudokuView :grid="step.grid" :can-fill-data-arr="[]" :elimination-data-arr="[step.afterFill.data]" :invalid-positions="[]" />
    </div>
    <div v-else-if="'elimination' in step">
      <div>Eliminate by {{ EliminationStrategy.strategyName(step.elimination.strategy) }}</div>
      <SudokuView :grid="step.grid" :can-fill-data-arr="[]" :elimination-data-arr="step.elimination.data" :invalid-positions="[]" />
    </div>
    <div v-else-if="'final' in step">
      <SudokuView :grid="step.grid" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FillStrategy from "../core/Sudoku/FillStrategy/FillStrategy";
import SudokuView from "./SudokuView.vue";
import type { Step } from "../core/Sudoku/SudokuSolver";
import EliminationStrategy from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";

const props = defineProps<{
  stepNum: number;
  step: Step;
}>();
</script>

<style></style>
