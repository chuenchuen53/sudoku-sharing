<template>
  <div class="-mt-3 pb-6">
    <div class="breadcrumbs mb-6">
      <ul>
        <li>
          <NuxtLink to="/solver">Solver</NuxtLink>
        </li>
        <li>Solution</li>
      </ul>
    </div>
    <div v-if="store.data" class="flex flex-col items-center">
      <div class="mb-8">
        <div class="text-3xl mb-4 text-primary">Puzzle</div>
        <SudokuView :grid="store.data.puzzle" :can-fill-data-arr="[]" :elimination-data-arr="[]" :invalid-positions="[]" />
      </div>
      <div class="mb-8" v-if="store.data && 'final' in store.data.steps[store.data.steps.length - 1]">
        <div class="text-2xl mb-4 text-primary">Solution</div>
        <SudokuView
          :grid="store.data.steps[store.data.steps.length - 1].grid"
          :can-fill-data-arr="[]"
          :elimination-data-arr="[]"
          :invalid-positions="[]"
        />
        <StatsTable class="my-4" :stats="store.data.stats" />
      </div>
      <div>
        <div class="text-2xl text-primary mb-4">Steps</div>
        <div class="space-y-8">
          <SudokuStep v-for="(step, index) in store.data.steps" :key="index" :step-num="index + 1" :step="step" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSolverSolutionStore } from "../../stores/solverSolution";
import SudokuStep from "../../components/SudokuStep.vue";
import SudokuView from "../../components/SudokuView.vue";
import StatsTable from "../../components/StatsTable.vue";

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
