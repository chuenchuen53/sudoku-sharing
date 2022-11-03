<template>
  <div id="sudoku-hint">
    <div>Hint</div>
    <hr />
    <div class="hint-buttons-container">
      <div>
        <el-button @click="getUniqueMissing">Unique Missing</el-button>
      </div>
      <div>
        <el-button @click="getBasicCandidates">Basic Candidates</el-button>
      </div>
      <div>
        <el-button @click="getNakedSingles">Naked Singles</el-button>
      </div>
      <div>
        <el-button @click="getHiddenSingles">Hidden Singles</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";

defineProps<{
  getUniqueMissing: () => void;
  getBasicCandidates: () => void;
  getNakedSingles: () => void;
  getHiddenSingles: () => void;
}>();
</script>

<style lang="scss" scoped>
#sudoku-hint {
  width: 150px;
  text-align: center;

  .hint-buttons-container {
    & > div {
      margin-top: 12px;
      margin-bottom: 12px;

      > button {
        width: 100%;
      }
    }
  }
}
</style>
