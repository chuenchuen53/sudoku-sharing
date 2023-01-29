<template>
  <div>
    <el-button-group>
      <el-button disabled id="highlight-button-group-label">highlight cell with candidates less than</el-button>
      <el-button @click="() => setNewCount(0)">x</el-button>
      <el-button
        v-for="x in options"
        :key="x"
        @click="() => setNewCount(x)"
        :type="selected === x ? 'primary' : 'default'"
        >{{ x }}</el-button
      >
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import type { CellWithIndex, SudokuElementWithZero } from "@/Sudoku/type";

const props = defineProps<{
  value: CellWithIndex[];
  onChange: (count: number) => void;
}>();

const selected = ref<number>(0);
const options = [3, 4, 5];

const setNewCount = (count: number) => {
  selected.value = count;
  props.onChange(count);
};
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
