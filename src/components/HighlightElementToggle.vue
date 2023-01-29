<template>
  <div>
    <el-button-group>
      <el-button disabled id="highlight-button-group-label">highlight</el-button>
      <el-button @click="() => onChange('0')">x</el-button>
      <el-button
        v-for="e in arrElements"
        :key="e"
        @click="() => onChange(e)"
        :type="value === e ? 'primary' : 'default'"
        >{{ e }}</el-button
      >
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import type { SudokuElementWithZero } from "@/Sudoku/type";

defineProps<{
  value: SudokuElementWithZero;
  onChange: (value: SudokuElementWithZero) => void;
}>();
const arrElements = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
</script>

<style lang="scss" scoped>
#highlight-button-group-label {
  color: var(--el-button-text-color);
  cursor: default;
}

.mt {
  margin-top: 24px;
}
</style>
