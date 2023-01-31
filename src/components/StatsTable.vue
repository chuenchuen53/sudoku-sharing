<template>
  <div>
    <el-table :data="data">
      <el-table-column prop="strategy" label="strategy" width="150" />
      <el-table-column prop="count" label="count" width="80" />
    </el-table>
    <br />
    <el-table :data="data2">
      <el-table-column prop="strategy" label="strategy" width="150" />
      <el-table-column prop="count" label="count" width="80" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import "element-plus/es/components/table/style/css";
import type { SolveStats } from "@/Sudoku/type";

const props = defineProps<{ stats: SolveStats }>();

const data = computed(() => {
  return [
    {
      strategy: "Unique Missing",
      count: props.stats.inputCount.uniqueMissing,
    },
    {
      strategy: "Naked Single",
      count: props.stats.inputCount.nakedSingle,
    },
    {
      strategy: "Hidden Single",
      count: props.stats.inputCount.hiddenSingle,
    },
  ];
});

const data2 = computed(() => {
  return [
    {
      strategy: "Locked Candidates",
      count: props.stats.eliminationCount.lockedCandidates,
    },
    {
      strategy: "Naked Pairs",
      count: props.stats.eliminationCount.nakedPairs,
    },
    {
      strategy: "Naked Triples",
      count: props.stats.eliminationCount.nakedTriplets,
    },
    {
      strategy: "Naked Quads",
      count: props.stats.eliminationCount.nakedQuads,
    },
    {
      strategy: "Hidden Pairs",
      count: props.stats.eliminationCount.hiddenPairs,
    },
    {
      strategy: "Hidden Triples",
      count: props.stats.eliminationCount.hiddenTriplets,
    },
    {
      strategy: "Hidden Quads",
      count: props.stats.eliminationCount.hiddenQuads,
    },
    {
      strategy: "X-Wing",
      count: props.stats.eliminationCount.xWing,
    },
    {
      strategy: "Y-Wing",
      count: props.stats.eliminationCount.yWing,
    },
  ];
});
</script>

<style lang="scss" scoped></style>
