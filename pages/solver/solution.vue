<template>
  <div class="text-sm breadcrumbs">
    <ul>
      <li>
        <NuxtLink to="/solver">Solver</NuxtLink>
      </li>
      <li>Solution</li>
    </ul>
  </div>
  <div v-if="store.data">
    <div class="my-8">
      <div class="text-xl">Solve</div>
      <SudokuView :grid="store.data.puzzle" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
    </div>
    <div class="space-y-8">
      <SudokuStep v-for="(step, index) in store.data.steps" :key="index" :step-num="index + 1" :step="step" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSolverSolutionStore } from "../../stores/solverSolution";
import SudokuStep from "../../components/SudokuStep.vue";
import SudokuView from "../../components/SudokuView.vue";

definePageMeta({
  middleware: (_to, _from) => {
    const store = useSolverSolutionStore();
    if (store.data === null) {
      return navigateTo("/solver");
    }
  },
});

const store = useSolverSolutionStore();
</script>
