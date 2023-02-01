<template>
  <div>
    <el-button @click="removeAllHighlight">remove highlight</el-button>
    <el-button @click="removeAllRemovalIndication">remove removal indication</el-button>
    <el-button @click="clearAllCandidates">clear candidates</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";
import "element-plus/es/components/button/style/css";

const sudokuSolverStore = useSudokuSolverStore();
const { removeAllHighlight, removeAllRemovalIndication, clearAllCandidates } = sudokuSolverStore;
</script>
