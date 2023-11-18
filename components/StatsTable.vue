<template>
  <div class="flex gap-1">
    <div class="flex-[1_1_50%]">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Fill</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Unique Missing</th>
            <td>{{ stats.filled.UNIQUE_MISSING }}</td>
          </tr>
          <tr>
            <th>Naked Single</th>
            <td>{{ stats.filled.NAKED_SINGLE }}</td>
          </tr>
          <tr>
            <th>Hidden Single</th>
            <td>{{ stats.filled.HIDDEN_SINGLE }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="Object.values(stats.elimination).some((x) => x !== 0)" class="flex-[1_1_50%]">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Eliminated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="x in SudokuSolver.enabledEliminationStrategies" :key="x" :class="{ hidden: stats.elimination[x] === 0 }">
            <th>{{ EliminationStrategy.strategyName(x) }}</th>
            <td>{{ stats.elimination[x] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import EliminationStrategy from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { Stats } from "../core/Sudoku/SolveStats";

defineProps<{
  stats: Stats;
}>();
</script>
7
