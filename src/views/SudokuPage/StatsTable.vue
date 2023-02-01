<template>
  <div>
    <el-table :data="inputData" title="input count">
      <el-table-column prop="strategy" label="strategy" width="150" />
      <el-table-column prop="count" label="count" width="80" />
    </el-table>
    <br />
    <el-table :data="eliminationData">
      <el-table-column prop="strategy" label="strategy" width="150" />
      <el-table-column prop="count" label="count" width="80" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import { storeToRefs } from "pinia";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";
import "element-plus/es/components/table/style/css";

const sudokuSolverStore = useSudokuSolverStore();
const { sudokuSolver } = storeToRefs(sudokuSolverStore);

const inputData = computed(() => {
  return [
    {
      strategy: "Unique Missing",
      count: sudokuSolver.value.stats.inputCount.uniqueMissing,
    },
    {
      strategy: "Naked Single",
      count: sudokuSolver.value.stats.inputCount.nakedSingle,
    },
    {
      strategy: "Hidden Single",
      count: sudokuSolver.value.stats.inputCount.hiddenSingle,
    },
  ];
});

const eliminationData = computed(() => {
  return [
    {
      strategy: "Locked Candidates",
      count: sudokuSolver.value.stats.eliminationCount.lockedCandidates,
    },
    {
      strategy: "Naked Pairs",
      count: sudokuSolver.value.stats.eliminationCount.nakedPairs,
    },
    {
      strategy: "Naked Triples",
      count: sudokuSolver.value.stats.eliminationCount.nakedTriplets,
    },
    {
      strategy: "Naked Quads",
      count: sudokuSolver.value.stats.eliminationCount.nakedQuads,
    },
    {
      strategy: "Hidden Pairs",
      count: sudokuSolver.value.stats.eliminationCount.hiddenPairs,
    },
    {
      strategy: "Hidden Triples",
      count: sudokuSolver.value.stats.eliminationCount.hiddenTriplets,
    },
    {
      strategy: "Hidden Quads",
      count: sudokuSolver.value.stats.eliminationCount.hiddenQuads,
    },
    {
      strategy: "X-Wing",
      count: sudokuSolver.value.stats.eliminationCount.xWing,
    },
    {
      strategy: "Y-Wing",
      count: sudokuSolver.value.stats.eliminationCount.yWing,
    },
  ];
});
</script>
