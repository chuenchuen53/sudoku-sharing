<template>
  <div id="eliminate-candidate">
    <div>Eliminate</div>
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
  removeCandidatesDueToLockedCandidates,
  removeCandidatesDueToNakedPairs,
  removeCandidatesDueToNakedTriplets,
  removeCandidatesDueToNakedQuads,
  removeCandidatesDueToHiddenPairs,
  removeCandidatesDueToHiddenTriplets,
  removeCandidatesDueToHiddenQuads,
  removeCandidatesDueToXWing,
  removeCandidatesDueToYWing,
} = sudokuSolverStore;

const buttons = [
  { text: "Locked Candidates", onClick: removeCandidatesDueToLockedCandidates },
  { text: "Naked Pairs", onClick: removeCandidatesDueToNakedPairs },
  { text: "Naked Triplets", onClick: removeCandidatesDueToNakedTriplets },
  { text: "Naked Quads", onClick: removeCandidatesDueToNakedQuads },
  { text: "Hidden Pairs", onClick: removeCandidatesDueToHiddenPairs },
  { text: "Hidden Triplets", onClick: removeCandidatesDueToHiddenTriplets },
  { text: "Hidden Quads", onClick: removeCandidatesDueToHiddenQuads },
  { text: "X-Wing", onClick: removeCandidatesDueToXWing },
  { text: "Y-Wing", onClick: removeCandidatesDueToYWing },
];
</script>

<style lang="scss" scoped>
#eliminate-candidate {
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
