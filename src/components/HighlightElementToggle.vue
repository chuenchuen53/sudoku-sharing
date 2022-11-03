<template>
  <div>
    <el-button @click="() => setHighlight('0')">x</el-button>
    <el-button
      v-for="e in arrElements"
      :key="e"
      @click="() => setHighlight(e)"
      :type="highlight === e ? 'primary' : 'default'"
      >{{ e }}</el-button
    >
  </div>
</template>

<script lang="ts">
import type { SudokuElementWithZero } from "@/Sudoku/type";
interface Props {
  highlight: SudokuElementWithZero;
  setHighlight: (value: SudokuElementWithZero) => void;
}
</script>

<script setup lang="ts">
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";

defineProps<Props>();
const arrElements = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
</script>

<style scoped></style>
