<template>
  <div>
    <el-table :data="data">
      <el-table-column prop="strategy" label="strategy" width="150" />
      <el-table-column prop="count" label="count" width="80" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { ElTable } from "element-plus";
import { ElTableColumn } from "element-plus";
import "element-plus/es/components/table/style/css";
import type { Stats } from "@/Sudoku/type";

const props = defineProps<{ stats: Stats }>();

const data = computed(() => {
  return [
    {
      strategy: "Unique Missing",
      count: props.stats.uniqueMissing,
    },
    {
      strategy: "Naked Single",
      count: props.stats.nakedSingle,
    },
    {
      strategy: "Hidden Single",
      count: props.stats.hiddenSingle,
    },
  ];
});
</script>

<style lang="scss" scoped></style>
