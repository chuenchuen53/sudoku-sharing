<template>
  <div id="sudoku-hint">
    <div>Hint</div>
    <hr />
    <div class="buttons-container">
      <div v-for="x in buttons" :key="x.text">
        <el-button @click="x.onClick">{{ x.text }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import { useSudokuSolverStore } from "@/stores/sudokuSolver";
import "element-plus/es/components/button/style/css";

const sudokuSolverStore = useSudokuSolverStore();
const {
  getUniqueMissing,
  getBasicCandidates,
  getNakedSingles,
  getHiddenSingles,
  getRemovalDueToLockedCandidates,
  getRemovalDueToNakedPairs,
  getRemovalDueToNakedTriplets,
  getRemovalDueToNakedQuads,
  getRemovalDueToHiddenPairs,
  getRemovalDueToHiddenTriplets,
  getRemovalDueToHiddenQuads,
  getRemovalDueToXWing,
  getRemovalDueToYWing,
} = sudokuSolverStore;

const buttons = [
  { text: "Unique Missing", onClick: getUniqueMissing },
  { text: "Basic Candidates", onClick: getBasicCandidates },
  { text: "Naked Singles", onClick: getNakedSingles },
  { text: "Hidden Singles", onClick: getHiddenSingles },
  { text: "Locked Candidates", onClick: getRemovalDueToLockedCandidates },
  { text: "Naked Pairs", onClick: getRemovalDueToNakedPairs },
  { text: "Naked Triplets", onClick: getRemovalDueToNakedTriplets },
  { text: "Naked Quads", onClick: getRemovalDueToNakedQuads },
  { text: "Hidden Pairs", onClick: getRemovalDueToHiddenPairs },
  { text: "Hidden Triplets", onClick: getRemovalDueToHiddenTriplets },
  { text: "Hidden Quads", onClick: getRemovalDueToHiddenQuads },
  { text: "X-Wing", onClick: getRemovalDueToXWing },
  { text: "Y-Wing", onClick: getRemovalDueToYWing },
];
</script>

<style lang="scss" scoped>
#sudoku-hint {
  width: 150px;
  text-align: center;

  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 8px;

    button {
      width: 100%;
    }
  }
}
</style>
