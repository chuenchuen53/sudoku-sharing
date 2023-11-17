<template>
  <div class="text-sm breadcrumbs">
    <ul>
      <li>
        <NuxtLink to="/solver">Solver</NuxtLink>
      </li>
      <li>Solution</li>
    </ul>
  </div>
  <div v-if="pageState.puzzle && pageState.steps">
    <div class="my-8">
      <div class="text-xl">Solve</div>
      <SudokuView :grid="pageState.puzzle" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
    </div>
    <div class="space-y-8">
      <SudokuStep v-for="(step, index) in pageState.steps" :key="index" :step-num="index + 1" :step="step" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSolverSolutionState } from "../../composables/solverSolutionState";
import SudokuStep from "../../components/SudokuStep.vue";
import SudokuView from "../../components/SudokuView.vue";

const pageState = useSolverSolutionState();
</script>
